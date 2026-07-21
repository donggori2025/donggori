/**
 * Supabase donggori 업장별 사진 추출
 * 업장마다 폴더 생성: {id}_{업장명}/
 *
 * 사용:
 *   node scripts/exportFactoryImages.js [출력폴더]
 *   npm run export:factory-images
 */
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const { list } = require("@vercel/blob");

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
const BLOB_HOST = "m7fjtbfe2aen7kcw.public.blob.vercel-storage.com";

if (!supabaseUrl || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|jfif)$/i;

function sanitizeFolderPart(name) {
  return String(name || "unknown")
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

function factoryDirName(id, companyName) {
  return `${id}_${sanitizeFolderPart(companyName)}`;
}

function isRemoteImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  const u = url.trim();
  if (!u.startsWith("http://") && !u.startsWith("https://")) return false;
  if (u.includes("/logo_donggori")) return false;
  return true;
}

function extFromUrl(url, contentType) {
  try {
    const p = new URL(url).pathname;
    const base = path.basename(decodeURIComponent(p));
    const m = base.match(/\.(jpe?g|png|gif|webp|jfif)$/i);
    if (m) return m[0].toLowerCase().replace("jpeg", ".jpg").replace(/^/, m[0].startsWith(".") ? "" : ".");
  } catch {}
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("webp")) return ".webp";
  if (contentType?.includes("gif")) return ".gif";
  return ".jpg";
}

function parseFactoryImageMeta() {
  const filePath = path.join(__dirname, "../lib/factoryImages.ts");
  const content = fs.readFileSync(filePath, "utf8");
  const companyToFolder = {};
  const folderFiles = {};

  const mappingBlock = content.match(/const factoryImageMapping[^=]*=\s*\{([\s\S]*?)\};/);
  if (mappingBlock) {
    const re = /'([^']+)':\s*'([^']+)'/g;
    let m;
    while ((m = re.exec(mappingBlock[1]))) companyToFolder[m[1]] = m[2];
  }

  const filesBlock = content.match(/const allImageFiles[^=]*=\s*\{([\s\S]*?)\n  \};/);
  if (filesBlock) {
    const entryRe = /'([^']+)':\s*\[([^\]]*)\]/g;
    let m;
    while ((m = entryRe.exec(filesBlock[1]))) {
      const files = [...m[2].matchAll(/'([^']+)'/g)].map((x) => x[1]);
      folderFiles[m[1]] = files;
    }
  }

  return { companyToFolder, folderFiles };
}

function listLocalPhotoFolders() {
  const baseCandidates = [
    path.join(__dirname, "../public/동고리_사진데이터"),
    path.join(__dirname, "../public/동고리_사진데이터"),
  ];
  const folders = {};
  for (const base of baseCandidates) {
    if (!fs.existsSync(base)) continue;
    for (const name of fs.readdirSync(base)) {
      const full = path.join(base, name);
      if (!fs.statSync(full).isDirectory()) continue;
      const files = fs
        .readdirSync(full)
        .filter((f) => IMAGE_EXT.test(f))
        .map((f) => path.join(full, f));
      if (!folders[name] || files.length > (folders[name].files?.length || 0)) {
        folders[name] = { path: full, files };
      }
    }
  }
  return folders;
}

function blobUrl(folder, fileName) {
  return `https://${BLOB_HOST}/${encodeURIComponent(folder)}/${encodeURIComponent(fileName)}`;
}

function resolveFolderCandidates(companyName, meta) {
  const folder = meta.companyToFolder[companyName];
  const reverse = Object.entries(meta.companyToFolder)
    .filter(([, f]) => f === companyName)
    .map(([c]) => c);
  return [...new Set([companyName, folder, ...reverse].filter(Boolean))];
}

async function fetchAllFactories() {
  const pageSize = 1000;
  let from = 0;
  const all = [];
  while (true) {
    const { data, error } = await supabase
      .from("donggori")
      .select("id, company_name, image")
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data?.length) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

async function loadAllBlobs() {
  if (!blobToken) {
    console.warn("⚠️ BLOB_READ_WRITE_TOKEN 없음 — Blob 목록 생략, URL 직접 다운로드만 시도");
    return [];
  }
  const all = [];
  let cursor;
  do {
    const res = await list({ token: blobToken, cursor });
    all.push(...(res.blobs || []));
    cursor = res.hasMore ? res.cursor : undefined;
  } while (cursor);
  return all;
}

function blobsForFolders(allBlobs, folderNames) {
  const set = new Set(folderNames);
  return allBlobs.filter((b) => {
    const top = (b.pathname || "").split("/")[0];
    return set.has(top);
  });
}

function collectSources(factory, meta, localFolders, allBlobs) {
  const companyName = (factory.company_name || "").trim();
  const folderCandidates = resolveFolderCandidates(companyName, meta);

  /** @type {{ type: 'url'|'local', src: string, name?: string }[]} */
  const items = [];
  const seen = new Set();

  const addUrl = (url, label) => {
    if (!isRemoteImageUrl(url) || seen.has(url)) return;
    seen.add(url);
    items.push({ type: "url", src: url, name: label });
  };

  const addLocal = (filePath) => {
    const key = `local:${filePath}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ type: "local", src: filePath, name: path.basename(filePath) });
  };

  if (isRemoteImageUrl(factory.image)) addUrl(factory.image, path.basename(factory.image));
  if (Array.isArray(factory.images)) {
    for (const u of factory.images) {
      if (isRemoteImageUrl(u)) addUrl(u, path.basename(u));
    }
  }

  for (const folder of folderCandidates) {
    const files = meta.folderFiles[folder] || [];
    for (const file of files) addUrl(blobUrl(folder, file), file);

    const local = localFolders[folder];
    if (local?.files) {
      for (const fp of local.files) addLocal(fp);
    }

    const blobHits = blobsForFolders(allBlobs, [folder]);
    for (const b of blobHits) {
      addUrl(b.url, path.basename(b.pathname));
    }
  }

  return { companyName, folderCandidates, items };
}

async function downloadUrl(url, destPath) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buf);
  return res.headers.get("content-type") || "";
}

async function exportFactory(factory, meta, localFolders, allBlobs, outRoot) {
  const { companyName, folderCandidates, items } = collectSources(
    factory,
    meta,
    localFolders,
    allBlobs
  );
  const dirName = factoryDirName(factory.id, companyName || `factory_${factory.id}`);
  const destDir = path.join(outRoot, dirName);

  if (!items.length) {
    return { dirName, companyName, count: 0, skipped: true };
  }

  fs.mkdirSync(destDir, { recursive: true });

  let index = 0;
  const saved = [];

  for (const item of items) {
    index += 1;
    try {
      if (item.type === "local") {
        const dest = path.join(destDir, item.name || `local_${index}${path.extname(item.src)}`);
        if (!fs.existsSync(dest)) fs.copyFileSync(item.src, dest);
        saved.push({ file: path.basename(dest), source: "local" });
        continue;
      }

      let fileName = item.name || `image_${String(index).padStart(2, "0")}`;
      if (!IMAGE_EXT.test(fileName)) {
        fileName += ".jpg";
      }
      const dest = path.join(destDir, fileName);
      if (fs.existsSync(dest)) {
        saved.push({ file: fileName, source: "url", note: "exists" });
        continue;
      }
      const ct = await downloadUrl(item.src, dest);
      saved.push({ file: path.basename(dest), source: "url", contentType: ct });
    } catch (e) {
      saved.push({ file: item.name || item.src, source: item.type, error: e.message });
    }
  }

  const metaJson = {
    id: factory.id,
    company_name: companyName,
    folder_candidates: folderCandidates,
    db_image: factory.image || null,
    db_images_count: Array.isArray(factory.images) ? factory.images.length : 0,
    exported_files: saved.filter((s) => !s.error).map((s) => s.file),
    errors: saved.filter((s) => s.error),
  };
  fs.writeFileSync(path.join(destDir, "_meta.json"), JSON.stringify(metaJson, null, 2), "utf8");

  const okCount = saved.filter((s) => !s.error).length;
  return { dirName, companyName, count: okCount, skipped: false };
}

async function main() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const defaultOut = path.join(__dirname, `../동고리_업장사진_${date}`);
  const outRoot = process.argv[2] ? path.resolve(process.argv[2]) : defaultOut;

  console.log("📥 업장 목록 조회...");
  const factories = await fetchAllFactories();
  console.log(`   ${factories.length}건`);

  const meta = parseFactoryImageMeta();
  const localFolders = listLocalPhotoFolders();
  console.log(`📁 로컬 사진 폴더: ${Object.keys(localFolders).length}개`);

  console.log("☁️ Vercel Blob 목록 조회...");
  const allBlobs = await loadAllBlobs();
  console.log(`   Blob 파일: ${allBlobs.length}개`);

  fs.mkdirSync(outRoot, { recursive: true });

  const summary = [];
  let withImages = 0;
  let totalFiles = 0;

  for (let i = 0; i < factories.length; i++) {
    const f = factories[i];
    const name = f.company_name || f.id;
    process.stdout.write(`\r[${i + 1}/${factories.length}] ${name}`.padEnd(50));
    const result = await exportFactory(f, meta, localFolders, allBlobs, outRoot);
    summary.push(result);
    if (!result.skipped) {
      withImages += 1;
      totalFiles += result.count;
    }
  }

  console.log("\n");

  const manifest = {
    generated_at: new Date().toISOString(),
    output_dir: outRoot,
    factory_count: factories.length,
    factories_with_images: withImages,
    total_files: totalFiles,
    factories: summary,
  };
  fs.writeFileSync(
    path.join(outRoot, "_manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );

  console.log("✅ 완료");
  console.log(`   출력: ${outRoot}`);
  console.log(`   이미지 있는 업장: ${withImages}/${factories.length}`);
  console.log(`   저장 파일 수: ${totalFiles}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
