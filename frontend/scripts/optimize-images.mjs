import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";

const SRC_DIR = path.resolve("images-src");
const OUT_DIR = path.resolve("public/images");
const MAX_WIDTH = 2000;

async function run() {
  await mkdir(OUT_DIR, { recursive: true });

  let files;
  try {
    files = await readdir(SRC_DIR);
  } catch {
    console.log(`No ${SRC_DIR} directory found — skipping image optimization.`);
    return;
  }

  const imageFiles = files.filter((f) => /\.(jpe?g|png)$/i.test(f));

  if (imageFiles.length === 0) {
    console.log("No source images found — skipping.");
    return;
  }

  for (const file of imageFiles) {
    const outName = file.replace(/\.(jpe?g|png)$/i, ".webp");
    const outPath = path.join(OUT_DIR, outName);

    await sharp(path.join(SRC_DIR, file))
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outPath);

    console.log(`Optimized ${file} -> images/${outName}`);
  }
}

run();
