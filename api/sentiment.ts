import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";
import { acquireGeminiQuota } from "../src/utils/geminiLimiter.ts";

function resolveGeminiModel(envModel?: string): string {
  const model = envModel?.trim();
  if (!model) return "gemini-2.5-flash";
  if (model.includes("3.5") || model.includes("3.0")) {
    return "gemini-2.5-flash";
  }
  return model;
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

function scanForCrisis(text: string): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase();
  const crisisRegex = /suicide|kill\s*myself|end\s*my\s*life|self\s*harm|want\s*to\s*die|harming\s*myself|cutting\s*myself|overdose|slit\s*my\s*wrist|taking\s*my\s*life|no\s*point\s*in\s*living|bunuh\s*diri|akhiri\s*hidup|ingin\s*mati|menyakiti\s*diri|gantung\s*diri|overdosis|sayat\s*lengan|tidak\s*mau\s*hidup|pengen\s*mati|akhiri\s*semuanya|capek\s*hidup|mati\s*aja|gak\s*kuat\s*hidup/i;
  return crisisRegex.test(normalized);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin as string | undefined;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Session-ID");
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { text } = req.body || {};

    if (!text) {
      return res.status(400).json({ error: "Isi jurnal wajib diisi" });
    }

    if (typeof text !== "string" || text.length > 5000) {
      return res.status(400).json({ error: "Teks jurnal terlalu panjang. Maksimal 5000 karakter." });
    }

    const safeText = stripHtml(text);
    const triggerCrisis = scanForCrisis(safeText);

    const rawKey = process.env.GEMINI_API_KEY || "";
    const cleanKey = rawKey.replace(/['"]/g, "").trim();

    if (!cleanKey || cleanKey === "MOCK_KEY") {
      return res.status(200).json({
        sentimentScore: triggerCrisis ? 1 : 6,
        primaryEmotion: triggerCrisis ? "Putus Asa" : "Reflektif",
        summaryQuote: triggerCrisis 
          ? "Kamu sedang memikul persoalan yang teramat berat hari ini. Tolong hubungi layanan SEJIWA 119 Ext 8 untuk keselamatan jiwamu." 
          : "Langkah menuliskan perasaan adalah bagian bermakna dari mengenali diri sendiri.",
        suggestedTags: ["jurnal-diri", "refleksi", "curahan-hati"],
        requiresIntervention: triggerCrisis
      });
    }

    // Rate Limiting Protection: strictly enforce 15 RPM, 500 RPD, 240k TPM
    const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || "127.0.0.1";
    const sessionId = (req.headers["x-session-id"] as string) || undefined;
    const estimatedTokens = Math.ceil((safeText.length + 800) / 3.5);

    const quota = await acquireGeminiQuota({
      ip: clientIp,
      sessionId,
      estimatedTokens,
    });

    res.setHeader("X-RateLimit-Limit-RPM", quota.maxRpm.toString());
    res.setHeader("X-RateLimit-Remaining-RPM", quota.remainingRpm.toString());
    res.setHeader("X-RateLimit-Limit-RPD", quota.maxRpd.toString());
    res.setHeader("X-RateLimit-Remaining-RPD", quota.remainingRpd.toString());

    if (!quota.allowed) {
      res.setHeader("Retry-After", quota.retryAfter.toString());
      return res.status(429).json({
        error: quota.error,
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: quota.retryAfter,
        currentRpm: quota.currentRpm,
        maxRpm: quota.maxRpm,
        currentRpd: quota.currentRpd,
        maxRpd: quota.maxRpd,
      });
    }

    const ai = new GoogleGenAI({
      apiKey: cleanKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const modelName = resolveGeminiModel(process.env.GEMINI_MODEL);

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Lakukan analisis sentimen kesehatan mental berkualitas tinggi pada jurnal harian berbahasa Indonesia di bawah ini (tuliskan keluaran emosi dan kutipan dalam Bahasa Indonesia dengan penuh empati, kebijakan, serta objektif):

---
${safeText}
---`,
      config: {
        systemInstruction: "Anda adalah parser sentimen emosional yang ramah. Berikan analisis akurat ramah dalam Bahasa Indonesia. Jawab eksklusif dalam format JSON terstruktur sesuai skema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentimentScore: {
              type: Type.INTEGER,
              description: "Skor keseimbangan emosi 0-10 (0=sangat gundah/cemas/panik, 10=sangat tenang/syukur/bahagia). 5 netral biasa."
            },
            primaryEmotion: {
              type: Type.STRING,
              description: "Emosi utama berfokus pada dinamika mental Indonesia, seperti Cemas, Sedih, Burnout, Syukur, Tenang, Dongkol, Kesepian, Overthinking, atau Lega."
            },
            summaryQuote: {
              type: Type.STRING,
              description: "Satu kalimat singkat berisi kalimat pendukung penuh kehangatan dalam bahasa Indonesia (maksimal 1 kalimat)."
            },
            suggestedTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 tag topik terkait suasana hati."
            },
            requiresIntervention: {
              type: Type.BOOLEAN,
              description: "True jika ada keputusasaan ekstrem atau dorongan bahaya."
            }
          },
          required: ["sentimentScore", "primaryEmotion", "summaryQuote", "suggestedTags", "requiresIntervention"]
        }
      }
    });

    const parsedResult = JSON.parse(response.text || "{}");
    return res.status(200).json(parsedResult);

  } catch (error: any) {
    console.error("Vercel Sentiment Function Error:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze sentiment" });
  }
}
