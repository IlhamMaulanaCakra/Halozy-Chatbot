import fs from "fs";
import path from "path";
import os from "os";

export interface QuotaRecord {
  id: string;
  timestamp: number; // epoch ms
  tokens: number;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  limitType?: "RPM" | "RPD" | "TPM";
  retryAfterSeconds?: number;
  message?: string;
  stats: {
    rpm: { limit: number; current: number; remaining: number };
    rpd: { limit: number; current: number; remaining: number };
    tpm: { limit: number; current: number; remaining: number };
  };
}

export interface AcquireResult extends RateLimitCheckResult {
  release?: (actualTokens?: number, isFailed?: boolean) => void;
}

export class GeminiRateLimiter {
  // Exact user limits:
  public readonly MAX_RPM: number = 15;        // Max 15 Requests Per Minute
  public readonly MAX_RPD: number = 500;       // Max 500 Requests Per Day
  public readonly MAX_TPM: number = 250_000;   // Max 250,000 Tokens Per Minute

  private readonly WINDOW_MINUTE_MS = 60 * 1000;
  private readonly WINDOW_DAY_MS = 24 * 60 * 60 * 1000;

  private records: QuotaRecord[] = [];
  private storageFile: string;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.storageFile = process.env.VERCEL
      ? path.join(os.tmpdir(), "gemini_quota_history.json")
      : path.join(process.cwd(), "gemini_quota_history.json");

    this.loadState();

    // Clean up stale records periodically every 5 minutes
    setInterval(() => {
      this.pruneStaleRecords();
    }, 5 * 60 * 1000).unref?.();
  }

  private loadState() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const now = Date.now();
          this.records = parsed.filter(
            (r) => typeof r.timestamp === "number" && now - r.timestamp < this.WINDOW_DAY_MS
          );
        }
      }
    } catch (err) {
      console.warn("[GeminiRateLimiter] Notice: starting with fresh quota state:", err);
      this.records = [];
    }
  }

  private scheduleSave() {
    if (this.saveTimeout) return;
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null;
      try {
        fs.writeFileSync(this.storageFile, JSON.stringify(this.records), "utf-8");
      } catch (err) {
        console.warn("[GeminiRateLimiter] Could not persist quota state:", err);
      }
    }, 1000);
  }

  private pruneStaleRecords() {
    const now = Date.now();
    const prevLength = this.records.length;
    this.records = this.records.filter((r) => now - r.timestamp < this.WINDOW_DAY_MS);
    if (this.records.length !== prevLength) {
      this.scheduleSave();
    }
  }

  /**
   * Estimates token count for an incoming prompt, text, or conversation history.
   * Indonesian & English words typically average ~3 characters per token with SentencePiece.
   */
  public estimateTokens(input: any, expectedOutputTokens: number = 500): number {
    let charCount = 0;
    if (typeof input === "string") {
      charCount = input.length;
    } else if (input && typeof input === "object") {
      try {
        charCount = JSON.stringify(input).length;
      } catch {
        charCount = 500;
      }
    }
    const inputTokens = Math.max(1, Math.ceil(charCount / 3));
    return inputTokens + expectedOutputTokens;
  }

  /**
   * Get current usage statistics
   */
  public getStats(now: number = Date.now()) {
    const minuteAgo = now - this.WINDOW_MINUTE_MS;
    const dayAgo = now - this.WINDOW_DAY_MS;

    const minuteRecords = this.records.filter((r) => r.timestamp > minuteAgo);
    const dayRecords = this.records.filter((r) => r.timestamp > dayAgo);

    const currentRpm = minuteRecords.length;
    const currentRpd = dayRecords.length;
    const currentTpm = minuteRecords.reduce((acc, curr) => acc + (curr.tokens || 0), 0);

    return {
      rpm: {
        limit: this.MAX_RPM,
        current: currentRpm,
        remaining: Math.max(0, this.MAX_RPM - currentRpm),
      },
      rpd: {
        limit: this.MAX_RPD,
        current: currentRpd,
        remaining: Math.max(0, this.MAX_RPD - currentRpd),
      },
      tpm: {
        limit: this.MAX_TPM,
        current: currentTpm,
        remaining: Math.max(0, this.MAX_TPM - currentTpm),
      },
    };
  }

  /**
   * Check if a request with given estimated tokens is permitted under RPM, RPD, and TPM limits.
   */
  public checkLimit(estimatedTokens: number = 500, now: number = Date.now()): RateLimitCheckResult {
    this.pruneStaleRecords();
    const stats = this.getStats(now);
    const minuteAgo = now - this.WINDOW_MINUTE_MS;
    const dayAgo = now - this.WINDOW_DAY_MS;

    const minuteRecords = this.records.filter((r) => r.timestamp > minuteAgo);
    const dayRecords = this.records.filter((r) => r.timestamp > dayAgo);

    // 1. Check RPM (Max 15 requests/minute)
    if (stats.rpm.current >= this.MAX_RPM) {
      const oldestInMinute = minuteRecords.reduce((min, r) => Math.min(min, r.timestamp), minuteRecords[0]?.timestamp || now);
      const retryAfterMs = Math.max(1000, oldestInMinute + this.WINDOW_MINUTE_MS - now);
      const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

      return {
        allowed: false,
        limitType: "RPM",
        retryAfterSeconds,
        message: `Batas 15 permintaan per menit (RPM) untuk model Gemini telah tercapai. Harap tunggu ${retryAfterSeconds} detik.`,
        stats,
      };
    }

    // 2. Check RPD (Max 500 requests/day)
    if (stats.rpd.current >= this.MAX_RPD) {
      const oldestInDay = dayRecords.reduce((min, r) => Math.min(min, r.timestamp), dayRecords[0]?.timestamp || now);
      const retryAfterMs = Math.max(1000, oldestInDay + this.WINDOW_DAY_MS - now);
      const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

      return {
        allowed: false,
        limitType: "RPD",
        retryAfterSeconds,
        message: `Batas 500 permintaan per hari (RPD) untuk model Gemini telah tercapai. Harap tunggu ${Math.ceil(retryAfterSeconds / 60)} menit.`,
        stats,
      };
    }

    // 3. Check TPM (Max 250,000 tokens/minute)
    if (stats.tpm.current + estimatedTokens > this.MAX_TPM) {
      const oldestInMinute = minuteRecords.reduce((min, r) => Math.min(min, r.timestamp), minuteRecords[0]?.timestamp || now);
      const retryAfterMs = Math.max(1000, oldestInMinute + this.WINDOW_MINUTE_MS - now);
      const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

      return {
        allowed: false,
        limitType: "TPM",
        retryAfterSeconds,
        message: `Batas 250.000 token per menit (TPM) untuk model Gemini telah tercapai (${stats.tpm.current} + ${estimatedTokens} > ${this.MAX_TPM}). Harap tunggu ${retryAfterSeconds} detik.`,
        stats,
      };
    }

    return {
      allowed: true,
      stats,
    };
  }

  /**
   * Atomically acquires a rate limit reservation.
   * Returns a release callback to update the actual token usage or discard on immediate failure.
   */
  public acquire(estimatedTokens: number = 500): AcquireResult {
    const now = Date.now();
    const check = this.checkLimit(estimatedTokens, now);

    if (!check.allowed) {
      return check;
    }

    const recordId = Math.random().toString(36).substring(2) + "-" + Date.now();
    const record: QuotaRecord = {
      id: recordId,
      timestamp: now,
      tokens: estimatedTokens,
    };

    this.records.push(record);
    this.scheduleSave();

    let released = false;
    const release = (actualTokens?: number, isFailed?: boolean) => {
      if (released) return;
      released = true;

      const idx = this.records.findIndex((r) => r.id === recordId);
      if (idx === -1) return;

      if (isFailed) {
        // If the request completely failed before reaching Gemini, remove reservation
        this.records.splice(idx, 1);
      } else if (typeof actualTokens === "number" && actualTokens > 0) {
        // Update with actual token count returned from response.usageMetadata
        this.records[idx].tokens = actualTokens;
      }
      this.scheduleSave();
    };

    return {
      allowed: true,
      stats: this.getStats(now),
      release,
    };
  }
}

// Global singleton instance
export const geminiRateLimiter = new GeminiRateLimiter();
