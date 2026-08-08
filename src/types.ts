export type Role = "user" | "model";

import { ClassificationResult } from "./utils/svmClassifier";

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  crisisTriggered?: boolean;
  svmResult?: ClassificationResult;
}

export interface PsychicMemo {
  id: string;
  title: string;
  content: string;
  tags: string[];
  sentimentScore: number; // 0-10 score. Plaintext for local trend chart!
  primaryEmotion: string; // "Cemas", "Kecewa", "Sedih", "Marah", "Tenang", "Bahagia", etc.
  summaryQuote?: string;  // Compassionate AI comment
  createdAt: number;
  updatedAt: number;
}
