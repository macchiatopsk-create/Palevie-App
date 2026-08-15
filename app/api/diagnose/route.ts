import { NextResponse } from "next/server";
import { toneProfiles } from "@/lib/palettes";
import { finalizeAiUsage, reserveAiUsage } from "@/lib/server/aiQuota";

function extractOutputText(data: any) {
  if (typeof data?.output_text === "string") return data.output_text;
  return (data?.output || []).flatMap((x: any) => x?.content || []).map((x: any) => x?.text || "").join(" ");
}
function parseJson(text: string) {
  const clean = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Invalid AI response");
  return JSON.parse(clean.slice(start, end + 1));
}
function clamp(value: unknown, min = -1, max = 1) {
  const n = Number(value);
  return Math.max(min, Math.min(max, Number.isFinite(n) ? n : 0));
}

export async function POST(request: Request) {
  let usageId: string | undefined;
  try {
    const body = await request.json();
    const imageDataUrl = body?.imageDataUrl;
    if (typeof imageDataUrl !== "string" || !/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(imageDataUrl)) return NextResponse.json({ error: "Invalid image." }, { status: 400 });
    if (imageDataUrl.length > 3_000_000) return NextResponse.json({ error: "Image is too large after resize." }, { status: 413 });

    const key = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_VISION_MODEL || "gpt-4o-mini";
    if (!key) return NextResponse.json({ error: "AI scan is not configured yet. Use the free quiz for now." }, { status: 503 });

    const visitor = (request.headers.get("x-palevie-visitor") || "anonymous").slice(0, 80);
    const reservation = await reserveAiUsage(visitor, "color_scan", model);
    usageId = reservation.usageId;
    if (!reservation.allowed) return NextResponse.json({ error: reservation.reason }, { status: 429 });

    const ids = toneProfiles.map(p => p.id).join(", ");
    const prompt = [
      "You are an assistive personal-color estimator for a fashion/beauty shopping app.",
      "This is style guidance only: not scientific, medical, biometric, identity, race/ethnicity, age, health, or attractiveness analysis.",
      "Lighting, camera white balance, makeup, hair dye and filters can make the estimate wrong.",
      `Choose the closest Korean-inspired 16-tone profile from this exact list: ${ids}.`,
      "Return JSON only with keys: primaryType, secondaryType, confidence, temperature, value, chroma, contrast, notes.",
      "confidence must be an integer 35-85. Axis values must be numbers from -1 to 1. notes must be one short sentence about uncertainty/visible color cues only.",
    ].join(" ");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        input: [{ role: "user", content: [{ type: "input_text", text: prompt }, { type: "input_image", image_url: imageDataUrl, detail: "low" }] }],
        max_output_tokens: 240,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      await finalizeAiUsage(usageId, "failed", data?.usage);
      return NextResponse.json({ error: `AI provider returned ${response.status}.` }, { status: 502 });
    }

    const parsed = parseJson(extractOutputText(data));
    const valid = new Set(toneProfiles.map(p => p.id));
    if (!valid.has(parsed.primaryType)) throw new Error("Unknown profile returned by AI.");
    const secondaryType = valid.has(parsed.secondaryType) ? parsed.secondaryType : parsed.primaryType;
    await finalizeAiUsage(usageId, "completed", data?.usage);

    return NextResponse.json({
      primaryType: parsed.primaryType,
      secondaryType,
      confidence: Math.round(clamp(parsed.confidence, 35, 85)),
      scores: {
        temperature: clamp(parsed.temperature),
        value: clamp(parsed.value),
        chroma: clamp(parsed.chroma),
        contrast: clamp(parsed.contrast),
      },
      notes: String(parsed.notes || "").slice(0, 240),
      quotaMode: reservation.mode,
    });
  } catch (e) {
    await finalizeAiUsage(usageId, "failed");
    return NextResponse.json({ error: e instanceof Error ? e.message : "AI scan failed." }, { status: 500 });
  }
}
