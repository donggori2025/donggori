import type { ProductFile } from "./types";

export function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  if (bytes >= 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${bytes}B`;
}

export function isImageFile(file: { mime: string; src: string; name: string }) {
  if (file.mime.startsWith("image/")) return true;
  if (file.src.startsWith("data:image/")) return true;
  return /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(file.name);
}

export function printShareFiles(files?: ProductFile[]) {
  const list = (files ?? []).filter((file) => file.kind === "label" || file.kind === "print");
  return [...list.filter((file) => file.kind === "label"), ...list.filter((file) => file.kind === "print")];
}

export function downloadProductFile(file: ProductFile) {
  const click = (href: string, revoke?: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = file.name || "download";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (revoke) window.setTimeout(() => URL.revokeObjectURL(revoke), 1000);
  };
  if (file.src.startsWith("data:")) {
    void fetch(file.src)
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        click(url, url);
      })
      .catch(() => click(file.src));
    return;
  }
  click(file.src);
}

export function readFilesAsProductFiles(
  list: FileList | File[],
  source: ProductFile["source"],
  kind?: ProductFile["kind"],
) {
  return Promise.all(Array.from(list).map((file) => readFileAsProductFile(file, source, kind)));
}

function readFileAsProductFile(file: File, source: ProductFile["source"], kind?: ProductFile["kind"]) {
  return new Promise<ProductFile>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        mime: file.type || "application/octet-stream",
        size: file.size,
        src: String(reader.result ?? ""),
        source,
        kind,
        purpose: "",
        createdAt: "방금",
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
