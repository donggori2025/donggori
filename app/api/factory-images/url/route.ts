import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

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

    try {
      const { blobs } = await list({ prefix: `${decodedFolder}/` });
      const found = blobs.find((b) => {
        try {
          const u = new URL(b.url);
          return decodeURIComponent(u.pathname).endsWith(`/${decodedFolder}/${decodedFile}`);
        } catch {
          return false;
        }
      });
      if (found) {
        return NextResponse.redirect(found.url, 302);
      }
    } catch {
      // Vercel Blob fallback
    }

    const baseNameNFC = "동고리_사진데이터";
    const baseNameNFD = baseNameNFC.normalize("NFD");
    const publicRoot = path.join(process.cwd(), "public");

    let actualBaseDir = baseNameNFC;
    try {
      const rootEntries = fs.readdirSync(publicRoot, { withFileTypes: true });
      const hit = rootEntries.find(
        (e) =>
          e.isDirectory() &&
          (e.name === baseNameNFC ||
            e.name === baseNameNFD ||
            e.name.normalize("NFC") === baseNameNFC ||
            e.name.normalize("NFD") === baseNameNFD)
      );
      if (hit) actualBaseDir = hit.name;
    } catch {}

    const baseDirPath = path.join(publicRoot, actualBaseDir);
    let actualFolderName: string | null = null;
    try {
      const folderEntries = fs.readdirSync(baseDirPath, { withFileTypes: true });
      const folderHit = folderEntries.find(
        (e) =>
          e.isDirectory() &&
          (e.name === decodedFolder ||
            e.name.normalize("NFC") === decodedFolder ||
            e.name.normalize("NFD") === decodedFolder.normalize("NFD"))
      );
      if (folderHit) actualFolderName = folderHit.name;
    } catch {}

    if (actualFolderName) {
      const folderPath = path.join(baseDirPath, actualFolderName);
      try {
        const fileEntries = fs.readdirSync(folderPath, { withFileTypes: true });
        const fileHit = fileEntries.find(
          (e) =>
            e.isFile() &&
            (e.name === decodedFile ||
              e.name.normalize("NFC") === decodedFile ||
              e.name.normalize("NFD") === decodedFile.normalize("NFD"))
        );

        if (fileHit) {
          const resolvedPath = path.join(folderPath, fileHit.name);
          const expectedBase = path.resolve(publicRoot);
          if (!path.resolve(resolvedPath).startsWith(expectedBase)) {
            return NextResponse.json({ ok: false, error: "잘못된 경로입니다." }, { status: 400 });
          }

          if (fs.existsSync(resolvedPath)) {
            const fileBuffer = fs.readFileSync(resolvedPath);
            const contentType = resolvedPath.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
            return new NextResponse(fileBuffer, {
              headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
              },
            });
          }
        }
      } catch {}
    }

    const publicUrl = new URL(
      `/${encodeURIComponent(actualBaseDir)}/${encodeURIComponent(decodedFolder)}/${encodeURIComponent(decodedFile)}`,
      req.url
    );
    return NextResponse.redirect(publicUrl.toString(), 302);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "failed" }, { status: 400 });
  }
}
