import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { getFactoryImageFolderCandidates } from "@/lib/factoryImages";

export const runtime = "nodejs";

function matchesName(candidate: string, target: string): boolean {
  return (
    candidate === target ||
    candidate.normalize("NFC") === target ||
    candidate.normalize("NFD") === target.normalize("NFD")
  );
}

async function findBlobImage(folder: string, file: string) {
  try {
    const { blobs } = await list({ prefix: `${folder}/` });
    return (
      blobs.find((blob) => {
        try {
          const blobUrl = new URL(blob.url);
          const blobPath = decodeURIComponent(blobUrl.pathname);
          return blobPath.endsWith(`/${folder}/${file}`);
        } catch {
          return false;
        }
      }) ?? null
    );
  } catch {
    return null;
  }
}

function readLocalImage(folder: string, file: string) {
  const baseNameNFC = "동고리_사진데이터";
  const baseNameNFD = baseNameNFC.normalize("NFD");
  const publicRoot = path.join(process.cwd(), "public");

  let actualBaseDir = baseNameNFC;
  try {
    const rootEntries = fs.readdirSync(publicRoot, { withFileTypes: true });
    const hit = rootEntries.find(
      (entry) =>
        entry.isDirectory() &&
        (entry.name === baseNameNFC ||
          entry.name === baseNameNFD ||
          entry.name.normalize("NFC") === baseNameNFC ||
          entry.name.normalize("NFD") === baseNameNFD)
    );
    if (hit) actualBaseDir = hit.name;
  } catch {}

  const baseDirPath = path.join(publicRoot, actualBaseDir);
  let actualFolderName: string | null = null;
  try {
    const folderEntries = fs.readdirSync(baseDirPath, { withFileTypes: true });
    const folderHit = folderEntries.find(
      (entry) => entry.isDirectory() && matchesName(entry.name, folder)
    );
    if (folderHit) actualFolderName = folderHit.name;
  } catch {}

  if (!actualFolderName) return null;

  const folderPath = path.join(baseDirPath, actualFolderName);
  try {
    const fileEntries = fs.readdirSync(folderPath, { withFileTypes: true });
    const fileHit = fileEntries.find(
      (entry) => entry.isFile() && matchesName(entry.name, file)
    );
    if (!fileHit) return null;

    const resolvedPath = path.join(folderPath, fileHit.name);
    const expectedBase = path.resolve(publicRoot);
    if (!path.resolve(resolvedPath).startsWith(expectedBase)) {
      return null;
    }
    if (!fs.existsSync(resolvedPath)) return null;

    const fileBuffer = fs.readFileSync(resolvedPath);
    const contentType = resolvedPath.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const folder = url.searchParams.get("folder");
    const file = url.searchParams.get("file");
    if (!folder || !file) {
      return NextResponse.json({ ok: false, error: "folder, file 필요" }, { status: 400 });
    }

    const decodedFolder = decodeURIComponent(folder);
    const decodedFile = decodeURIComponent(file);

    if (
      decodedFolder.includes("..") ||
      decodedFile.includes("..") ||
      decodedFolder.includes("/") ||
      decodedFile.includes("/") ||
      decodedFolder.includes("\\") ||
      decodedFile.includes("\\")
    ) {
      return NextResponse.json({ ok: false, error: "잘못된 경로입니다." }, { status: 400 });
    }

    const folderCandidates = getFactoryImageFolderCandidates(decodedFolder);

    for (const folderName of folderCandidates) {
      const blob = await findBlobImage(folderName, decodedFile);
      if (blob) {
        return NextResponse.redirect(blob.url, 302);
      }
    }

    for (const folderName of folderCandidates) {
      const localImage = readLocalImage(folderName, decodedFile);
      if (localImage) {
        return localImage;
      }
    }

    const publicUrl = new URL(
      `/${encodeURIComponent("동고리_사진데이터")}/${encodeURIComponent(decodedFolder)}/${encodeURIComponent(decodedFile)}`,
      req.url
    );
    return NextResponse.redirect(publicUrl.toString(), 302);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "failed" }, { status: 400 });
  }
}
