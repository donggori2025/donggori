/**
 * 업장 사진 폴더 → Vercel Blob 업로드
 *
 * 폴더명이 곧 Blob 경로의 prefix가 된다: {폴더명}/{파일명}
 * macOS 파일명은 유니코드 NFD로 저장되므로 NFC로 정규화해 올린다.
 *
 * 사용:
 *   node scripts/uploadFactoryPhotos.js "/path/to/사진루트"                       # 미리보기
 *   node scripts/uploadFactoryPhotos.js "/path/to/사진루트" --apply               # 전체 업로드
 *   node scripts/uploadFactoryPhotos.js "/path/to/사진루트" --apply --only 미니팩토리,신원자수
 *   node scripts/uploadFactoryPhotos.js "/path/to/사진루트" --apply --as "제훈사 (구 아이템)=제훈사"
 */
const fs = require("fs");
const path = require("path");
const { put, list } = require("@vercel/blob");

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error("BLOB_READ_WRITE_TOKEN 이 필요합니다.");
  process.exit(1);
}

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".jfif"]);

const CONTENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jfif": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function nfc(value) {
  return String(value).normalize("NFC");
}

/** 파일명 끝의 _01, _02 같은 일련번호를 숫자로 인식해 사람이 보는 순서대로 정렬한다 */
function naturalCompare(a, b) {
  return a.localeCompare(b, "ko", { numeric: true, sensitivity: "base" });
}

function listImages(dir) {
  return fs
    .readdirSync(dir)
    .filter((name) => !name.startsWith("."))
    .filter((name) => fs.statSync(path.join(dir, name)).isFile())
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .map(nfc)
    .sort(naturalCompare);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const root = args.find((a) => !a.startsWith("--"));
  const apply = args.includes("--apply");

  const onlyIndex = args.indexOf("--only");
  const only =
    onlyIndex >= 0 && args[onlyIndex + 1]
      ? new Set(args[onlyIndex + 1].split(",").map((s) => nfc(s.trim())))
      : null;

  // "폴더명=Blob폴더명" 형태로 업로드 대상 이름을 바꿔 올린다
  const aliases = new Map();
  args.forEach((arg, i) => {
    if (arg === "--as" && args[i + 1]) {
      const [from, to] = args[i + 1].split("=");
      if (from && to) aliases.set(nfc(from.trim()), nfc(to.trim()));
    }
  });

  return { root, apply, only, aliases };
}

async function existingBlobFiles(folder) {
  const result = await list({ prefix: `${folder}/`, token, limit: 1000 });
  return new Set(result.blobs.map((b) => nfc(b.pathname.split("/").pop())));
}

async function main() {
  const { root, apply, only, aliases } = parseArgs();

  if (!root || !fs.existsSync(root)) {
    console.error("사진 루트 폴더를 찾을 수 없습니다:", root || "(경로 미지정)");
    process.exit(1);
  }

  console.log("📁 루트:", root);
  console.log(apply ? "⚙️  모드: 실제 업로드 (--apply)" : "🔍 모드: 미리보기 (업로드 없음)");

  const dirs = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort(naturalCompare);

  let totalUploaded = 0;
  let totalSkipped = 0;
  const summary = [];

  for (const dirName of dirs) {
    const label = nfc(dirName);
    if (only && !only.has(label)) continue;

    const blobFolder = aliases.get(label) || label;
    const files = listImages(path.join(root, dirName));
    if (files.length === 0) continue;

    const already = await existingBlobFiles(blobFolder);
    const pending = files.filter((f) => !already.has(f));

    console.log(
      `\n[${blobFolder}] 로컬 ${files.length}개 / Blob 기존 ${already.size}개 / 업로드 대상 ${pending.length}개`
    );

    if (!apply) {
      pending.forEach((f) => console.log(`   + ${f}`));
      totalSkipped += pending.length;
      summary.push({ blobFolder, files });
      continue;
    }

    for (const fileName of pending) {
      // 로컬 파일은 NFD 이름일 수 있으므로 실제 디렉터리 엔트리에서 원본 이름을 찾는다
      const realName = fs
        .readdirSync(path.join(root, dirName))
        .find((n) => nfc(n) === fileName);
      const buffer = fs.readFileSync(path.join(root, dirName, realName));
      const contentType = CONTENT_TYPES[path.extname(fileName).toLowerCase()] || "image/jpeg";

      await put(`${blobFolder}/${fileName}`, buffer, {
        access: "public",
        contentType,
        addRandomSuffix: false,
        allowOverwrite: false,
        token,
      });
      totalUploaded++;
      console.log(`   ✓ ${fileName}`);
    }

    summary.push({ blobFolder, files });
  }

  console.log(
    apply ? `\n✅ 업로드 완료: ${totalUploaded}개` : `\n미리보기 종료: 업로드 예정 ${totalSkipped}개`
  );

  if (summary.length) {
    console.log("\n--- lib/factoryImages.ts 의 allImageFiles 에 넣을 항목 ---");
    summary.forEach(({ blobFolder, files }) => {
      const quoted = files.map((f) => `'${f}'`).join(", ");
      console.log(`    '${blobFolder}': [${quoted}],`);
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
