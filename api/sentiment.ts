import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";
import { geminiRateLimiter } from "../geminiRateLimiter";

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

function scanForCrisis(text: string): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase();
  const crisisRegex = /suicide|kill\s*myself|end\s*my\s*life|self\s*harm|want\s*to\s*die|harming\s*myself|cutting\s*myself|overdose|slit\s*my\s*wrist|taking\s*my\s*life|no\s*point\s*in\s*living|bunuh\s*diri|akhiri\s*hidup|ingin\s*mati|menyakiti\s*diri|gantung\s*diri|overdosis|sayat\s*lengan|tidak\s*mau\s*hidup|pengen\s*mati|akhiri\s*semuanya|capek\s*hidup|mati\s*aja|gak\s*kuat\s*hidup/i;
  return crisisRegex.test(normalized);
}

// Rate Limiter for Sentiment
const sentimentUsageMap = new Map<string, { lastRequestTime: number; count: number; windowStart: number }>();

function checkSentimentRateLimit(clientId: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  let usage = sentimentUsageMap.get(clientId);
  if (!usage) {
    sentimentUsageMap.set(clientId, { lastRequestTime: now, count: 1, windowStart: now });
    return { allowed: true };
  }

  // 3s cooldown
  if (now - usage.lastRequestTime < 3000) {
    return { allowed: false, reason: "Mohon tunggu 3 detik sebelum melakukan analisis sentimen lagi." };
  }

  // Max 5 per minute
  if (now - usage.windowStart < 60 * 1000) {
    if (usage.count >= 5) {
      return { allowed: false, reason: "Batas analisis sentimen per menit tercapai (maksimal 5 kali/menit)." };
    }
    usage.count += 1;
  } else {
    usage.windowStart = now;
    usage.count = 1;
  }

  usage.lastRequestTime = now;
  return { allowed: true };
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

  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.socket?.remoteAddress || "unknown-ip";
  const rate = checkSentimentRateLimit(ip);
  if (!rate.allowed) {
    return res.status(429).json({ error: rate.reason });
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

    const rawKey = process.env.GEMINI_API_KEY || process.env.Halozy_API_Key || process.env.HALOZY_API_KEY || "";
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

    const ai = new GoogleGenAI({
      apiKey: cleanKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

    // Enforce Gemini Rate Limiting (RPM 15, RPD 500, TPM 250k)
    const estimatedTokens = geminiRateLimiter.estimateTokens(safeText, 500);
    const quota = geminiRateLimiter.acquire(estimatedTokens);

    if (!quota.allowed) {
      res.setHeader("Retry-After", quota.retryAfterSeconds || 60);
      res.setHeader("X-RateLimit-Limit-RPM", geminiRateLimiter.MAX_RPM);
      res.setHeader("X-RateLimit-Limit-RPD", geminiRateLimiter.MAX_RPD);
      res.setHeader("X-RateLimit-Limit-TPM", geminiRateLimiter.MAX_TPM);
      return res.status(429).json({
        error: quota.message,
        rateLimited: true,
        limitType: quota.limitType,
        retryAfterSeconds: quota.retryAfterSeconds,
        stats: quota.stats,
      });
    }

    try {
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

      const totalTokens = response?.usageMetadata?.totalTokenCount;
      quota.release?.(totalTokens);

      const parsedResult = JSON.parse(response.text || "{}");
      return res.status(200).json(parsedResult);
    } catch (err: any) {
      quota.release?.(undefined, true);
      throw err;
    }

  } catch (error: any) {
    console.error("Vercel Sentiment Function Error:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze sentiment" });
  }
}