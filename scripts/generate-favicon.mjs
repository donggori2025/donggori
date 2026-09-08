import { writeFile } from "node:fs/promises";
import sharp from "sharp";

// Keep the approved logo unchanged; its left symbol occupies x=0..42 of 113.
const symbol = await sharp(new URL("../public/logo_donggori.svg", import.meta.url).pathname, { density: 576 })
  .extract({ left: 0, top: 0, width: 336, height: 376 })
  .png()
  .toBuffer();
const square = await sharp(symbol)
  .trim()
  .resize(80, 80, { fit: "contain", background: "white" })
  .extend({ top: 8, bottom: 8, left: 8, right: 8, background: "white" })
  .flatten({ background: "white" })
  .png()
  .toBuffer();

// A real ICO container, with PNG frames for browser tabs and Google Search.
// Next.js reads the first frame for the generated <link sizes> attribute.
const sizes = [96, 48, 32, 16];
const frames = await Promise.all(sizes.map((size) => sharp(square).resize(size, size).png().toBuffer()));
const directory = Buffer.alloc(6 + 16 * sizes.length);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
for (const [index, size] of sizes.entries()) {
  const entry = 6 + 16 * index;
  directory[entry] = size;
  directory[entry + 1] = size;
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(frames[index].length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += frames[index].length;
}
const ico = Buffer.concat([directory, ...frames]);
for (const path of ["../app/favicon.ico", "../public/favicon.ico"]) {
  await writeFile(new URL(path, import.meta.url), ico);
}
console.log(`Generated matching app/public favicons: ${sizes.join(", ")}px, ${ico.length} bytes`);
