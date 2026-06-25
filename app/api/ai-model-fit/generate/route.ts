import { NextResponse } from "next/server";
import sharp from "sharp";
import { put } from "@vercel/blob";
import {
  type ModelFeature,
  type ModelGender,
  type ModelMood,
  type ModelSize,
  resolveModelImage,
} from "@/lib/aiModelFit";

export const runtime = "nodejs";
export const maxDuration = 60;

const OUTPUT_WIDTH = 800;
const OUTPUT_HEIGHT = 1200;

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`모델 이미지를 불러오지 못했습니다. (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

async function compositeGarmentOnModel(
  modelImageUrl: string,
  garmentBuffer: Buffer,
  placement: { top: number; left: number; width: number }
): Promise<Buffer> {
  const modelBuffer = await fetchImageBuffer(modelImageUrl);

  const base = await sharp(modelBuffer)
    .resize(OUTPUT_WIDTH, OUTPUT_HEIGHT, { fit: "cover" })
    .toBuffer();

  const garment = await sharp(garmentBuffer)
    .resize(placement.width, Math.round(placement.width * 1.15), {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const scaledTop = Math.round((placement.top / 900) * OUTPUT_HEIGHT);
  const scaledLeft = Math.round((placement.left / 900) * OUTPUT_WIDTH);
  const scaledWidth = Math.round((placement.width / 900) * OUTPUT_WIDTH);

  const fittedGarment = await sharp(garment)
    .resize(scaledWidth, Math.round(scaledWidth * 1.15), {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp(base)
    .composite([
      {
        input: fittedGarment,
        top: scaledTop,
        left: scaledLeft,
        blend: "over",
      },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const garment = form.get("garment");

    if (!(garment instanceof File) || garment.size === 0) {
      return NextResponse.json({ success: false, error: "의류 이미지를 업로드해주세요." }, { status: 400 });
    }

    if (!garment.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
    }

    if (garment.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "이미지는 10MB 이하만 가능합니다." }, { status: 400 });
    }

    const gender = (String(form.get("gender") || "female") as ModelGender) || "female";
    const size = (String(form.get("size") || "regular") as ModelSize) || "regular";
    const mood = (String(form.get("mood") || "studio") as ModelMood) || "studio";
    const templateId = form.get("templateId") ? String(form.get("templateId")) : null;
    const customPrompt = String(form.get("customPrompt") || "").trim();
    const features = String(form.get("features") || "")
      .split(",")
      .filter(Boolean) as ModelFeature[];

    const garmentBuffer = Buffer.from(await garment.arrayBuffer());
    const { modelImageUrl, placement } = resolveModelImage(gender, mood, templateId);

    const outputBuffer = await compositeGarmentOnModel(modelImageUrl, garmentBuffer, placement);

    const fileName = `ai-model-fit/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    let imageUrl: string;
    if (blobToken) {
      const blob = await put(fileName, outputBuffer, {
        access: "public",
        contentType: "image/jpeg",
        token: blobToken,
      });
      imageUrl = blob.url;
    } else {
      const base64 = outputBuffer.toString("base64");
      imageUrl = `data:image/jpeg;base64,${base64}`;
    }

    return NextResponse.json({
      success: true,
      data: {
        imageUrl,
        mode: "ai-composite",
        meta: { gender, size, mood, features, templateId, customPrompt: customPrompt || null },
      },
    });
  } catch (error) {
    console.error("[ai-model-fit/generate]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "모델컷 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
