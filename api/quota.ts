import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGeminiQuotaStatus } from "../src/utils/geminiLimiter";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin as string | undefined;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  return res.status(200).json(getGeminiQuotaStatus());
}
