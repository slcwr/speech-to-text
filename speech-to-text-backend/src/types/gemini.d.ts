// Type definitions for Gemini API interactions

export interface InlineData {
  mimeType: string;
  data: string;
}

export interface ContentPart {
  inlineData?: InlineData;
  text?: string;
}

export type Content = string | ContentPart;

export interface GenerateContentResult {
  response: GenerateContentResponse;
}

export interface GenerateContentResponse {
  text(): string;
  candidates?: Candidate[];
  promptFeedback?: PromptFeedback;
}

export interface Candidate {
  content: {
    parts: Part[];
    role: string;
  };
  finishReason?: string;
  index: number;
  safetyRatings?: SafetyRating[];
}

export interface Part {
  text?: string;
}

export interface PromptFeedback {
  blockReason?: string;
  safetyRatings?: SafetyRating[];
}

export interface SafetyRating {
  category: string;
  probability: string;
}

export interface GeminiError extends Error {
  code?: string;
  status?: number;
  details?: any;
}

export interface TranscriptionError extends Error {
  originalError?: any;
  filePath?: string;
}