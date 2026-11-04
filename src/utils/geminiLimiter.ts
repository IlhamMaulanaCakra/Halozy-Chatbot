import fs from "fs";
import path from "path";
import os from "os";

export interface RateLimitStatus {
  allowed: boolean;
  statusCode: number;
  reason?: "RPM" | "RPD" | "TPM" | "BURST";
  error?: string;
  retryAfter: number; // in seconds
  currentRpm: number;
  maxRpm: number;
  remainingRpm: number;
  currentRpd: number;
  maxRpd: number;
  remainingRpd: number;
  currentTpm: number;
  maxTpm: number;
}

interface RequestRecord {
  timestamp: number;
  tokens: number;
  ip?: string;
  sessionId?: string;
}

interface StoredQuotaState {
  requests: RequestRecord[];
  dailyCount: number;
  dailyDate: string; // YYYY-MM-DD in UTC
}

const MAX_RPM = Number(process.env.GEMINI_MAX_RPM) || 15;
const MAX_RPD = Number(process.env.GEMINI_MAX_RPD) || 500;
const MAX_TPM = Number(process.env.GEMINI_MAX_TPM) || 240000;
const MAX_IP_RPM = Number(process.env.GEMINI_MAX_IP_RPM) || 15;

const STATE_FILE = process.env.VERCEL
  ? path.join(os.tmpdir(), "gemini_quota_state.json")
  : path.join(process.cwd(), "gemini_quota_state.json");

let memoryState: StoredQuotaState = {
  requests: [],
  dailyCount: 0,
  dailyDate: new Date().toISOString().slice(0, 10),
};

function loadState(): StoredQuotaState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.requests)) {
        return parsed;
      }
    }
  } catch (e) {
    // Fall back to memory state if file read fails
  }
  return memoryState;
}

function persistState(state: StoredQuotaState) {
  memoryState = state;
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state), "utf-8");
  } catch (e) {
    // Non-fatal if ephemeral filesystem fails
  }
}

// Global mutex lock to prevent concurrent race conditions
let lock = Promise.resolve();
function withLock<T>(fn: () => Promise<T> | T): Promise<T> {
  const next = lock.then(fn, fn);
  lock = next.then(() => {});
  return next;
}

/**
 * Checks and acquires a quota slot for a Gemini API call.
 * Enforces:
 * 1. Global RPM <= 15
 * 2. Global RPD <= 500
 * 3. Global TPM <= 240,000
 * 4. Per-IP RPM <= 15
 */
export async function acquireGeminiQuota(options: {
  ip?: string;
  sessionId?: string;
  estimatedTokens?: number;
}): Promise<RateLimitStatus> {
  return withLock(() => {
    const now = Date.now();
    const currentDate = new Date().toISOString().slice(0, 10);
    const tokens = options.estimatedTokens || 500;

    const state = loadState();

    // Reset daily counter if a new UTC day has started
    if (state.dailyDate !== currentDate) {
      state.dailyDate = currentDate;
      state.dailyCount = 0;
    }

    // Purge records older than 60 seconds (1 minute rolling window)
    const windowStart = now - 60 * 1000;
    state.requests = state.requests.filter((r) => r.timestamp > windowStart);

    const currentRpm = state.requests.length;
    const currentTpm = state.requests.reduce((sum, r) => sum + (r.tokens || 0), 0);
    const currentRpd = state.dailyCount;

    // 1. Check RPD (Requests Per Day - max 500)
    if (currentRpd >= MAX_RPD) {
      const midnightUtc = new Date();
      midnightUtc.setUTCHours(24, 0, 0, 0);
      const retryAfterSeconds = Math.max(1, Math.ceil((midnightUtc.getTime() - now) / 1000));

      return {
        allowed: false,
        statusCode: 429,
        reason: "RPD",
        error: `Batas harian ${MAX_RPD} permintaan AI telah tercapai (RPD limit). Silakan coba lagi besok.`,
        retryAfter: retryAfterSeconds,
        currentRpm,
        maxRpm: MAX_RPM,
        remainingRpm: 0,
        currentRpd,
        maxRpd: MAX_RPD,
        remainingRpd: 0,
        currentTpm,
        maxTpm: MAX_TPM,
      };
    }

    // 2. Check Global RPM (Requests Per Minute - max 15)
    if (currentRpm >= MAX_RPM) {
      const oldest = state.requests[0]?.timestamp || now;
      const retryAfterSeconds = Math.max(1, Math.ceil((oldest + 60 * 1000 - now) / 1000));

      return {
        allowed: false,
        statusCode: 429,
        reason: "RPM",
        error: `Batas kecepatan percakapan tercapai (maksimal ${MAX_RPM} permintaan per menit). Mohon tunggu ${retryAfterSeconds} detik sebelum mengirim lagi.`,
        retryAfter: retryAfterSeconds,
        currentRpm,
        maxRpm: MAX_RPM,
        remainingRpm: 0,
        currentRpd,
        maxRpd: MAX_RPD,
        remainingRpd: Math.max(0, MAX_RPD - currentRpd),
        currentTpm,
        maxTpm: MAX_TPM,
      };
    }

    // 3. Check Per-IP RPM (if IP provided)
    if (options.ip && MAX_IP_RPM < MAX_RPM) {
      const ipRequests = state.requests.filter((r) => r.ip === options.ip);
      if (ipRequests.length >= MAX_IP_RPM) {
        const oldestIp = ipRequests[0]?.timestamp || now;
        const retryAfterSeconds = Math.max(1, Math.ceil((oldestIp + 60 * 1000 - now) / 1000));

        return {
          allowed: false,
          statusCode: 429,
          reason: "RPM",
          error: `Terlalu banyak permintaan dari koneksi Anda (maksimal ${MAX_IP_RPM} pesan per menit). Mohon tunggu ${retryAfterSeconds} detik.`,
          retryAfter: retryAfterSeconds,
          currentRpm,
          maxRpm: MAX_RPM,
          remainingRpm: Math.max(0, MAX_RPM - currentRpm),
          currentRpd,
          maxRpd: MAX_RPD,
          remainingRpd: Math.max(0, MAX_RPD - currentRpd),
          currentTpm,
          maxTpm: MAX_TPM,
        };
      }
    }

    // 4. Check TPM (Tokens Per Minute - max 240k)
    if (currentTpm + tokens > MAX_TPM) {
      const oldest = state.requests[0]?.timestamp || now;
      const retryAfterSeconds = Math.max(1, Math.ceil((oldest + 60 * 1000 - now) / 1000));

      return {
        allowed: false,
        statusCode: 429,
        reason: "TPM",
        error: `Batas token per menit tercapai (TPM limit). Mohon tunggu ${retryAfterSeconds} detik.`,
        retryAfter: retryAfterSeconds,
        currentRpm,
        maxRpm: MAX_RPM,
        remainingRpm: Math.max(0, MAX_RPM - currentRpm),
        currentRpd,
        maxRpd: MAX_RPD,
        remainingRpd: Math.max(0, MAX_RPD - currentRpd),
        currentTpm,
        maxTpm: MAX_TPM,
      };
    }

    // Slot is allowed! Record it atomically.
    state.requests.push({
      timestamp: now,
      tokens,
      ip: options.ip,
      sessionId: options.sessionId,
    });
    state.dailyCount += 1;

    persistState(state);

    const updatedRpm = state.requests.length;
    const updatedRpd = state.dailyCount;

    return {
      allowed: true,
      statusCode: 200,
      retryAfter: 0,
      currentRpm: updatedRpm,
      maxRpm: MAX_RPM,
      remainingRpm: Math.max(0, MAX_RPM - updatedRpm),
      currentRpd: updatedRpd,
      maxRpd: MAX_RPD,
      remainingRpd: Math.max(0, MAX_RPD - updatedRpd),
      currentTpm: currentTpm + tokens,
      maxTpm: MAX_TPM,
    };
  });
}

/**
 * Returns current live quota statistics without acquiring a slot.
 */
export function getGeminiQuotaStatus(): {
  currentRpm: number;
  maxRpm: number;
  remainingRpm: number;
  currentRpd: number;
  maxRpd: number;
  remainingRpd: number;
  currentTpm: number;
  maxTpm: number;
} {
  const now = Date.now();
  const state = loadState();
  const windowStart = now - 60 * 1000;
  const recent = state.requests.filter((r) => r.timestamp > windowStart);
  const currentRpm = recent.length;
  const currentTpm = recent.reduce((sum, r) => sum + (r.tokens || 0), 0);

  return {
    currentRpm,
    maxRpm: MAX_RPM,
    remainingRpm: Math.max(0, MAX_RPM - currentRpm),
    currentRpd: state.dailyCount,
    maxRpd: MAX_RPD,
    remainingRpd: Math.max(0, MAX_RPD - state.dailyCount),
    currentTpm,
    maxTpm: MAX_TPM,
  };
}
