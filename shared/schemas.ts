import { z } from 'zod';

// 基本的なスキーマ
export const uuidSchema = z.string().uuid();

// スキルデータスキーマ
export const skillDataSchema = z.object({
  technical_skills: z.array(z.string()),
  experience_years: z.number().min(0).max(50),
  projects: z.array(z.object({
    name: z.string(),
    role: z.string(),
    technologies: z.array(z.string()),
    duration_months: z.number().min(1),
  })),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  problem_solving: z.object({
    approach: z.string(),
    examples: z.array(z.object({
      situation: z.string(),
      task: z.string(),
      action: z.string(),
      result: z.string(),
    })),
    methodologies: z.array(z.string()),
    collaboration_style: z.string(),
  }),
  certifications: z.array(z.string()).optional(),
  education: z.string().optional(),
  languages: z.array(z.string()).optional(),
});

// 質問データスキーマ
export const questionDataSchema = z.object({
  text: z.string(),
  audio_url: z.string().optional(),
  duration_seconds: z.number().optional(),
  metadata: z.object({
    difficulty: z.enum(['easy', 'medium', 'hard']),
    category: z.string(),
    based_on_skills: z.array(z.string()).optional(),
    based_on_problem_solving: z.boolean().optional(),
  }),
});

// 回答データスキーマ
export const answerDataSchema = z.object({
  text: z.string(),
  confidence_score: z.number().min(0).max(1),
  transcription_segments: z.array(z.object({
    start_time: z.number(),
    end_time: z.number(),
    text: z.string(),
    confidence: z.number().min(0).max(1),
  })),
  audio_metadata: z.object({
    duration_seconds: z.number(),
    sample_rate: z.number(),
    channels: z.number(),
  }),
  analysis: z.object({
    key_points: z.array(z.string()),
    sentiment: z.enum(['positive', 'neutral', 'negative']),
    fluency_score: z.number().min(0).max(1),
    problem_solving_indicators: z.array(z.string()).optional(),
  }),
});

// リクエスト・レスポンス用スキーマ
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export const uploadSkillSheetSchema = z.object({
  user_id: uuidSchema,
  file_name: z.string(),
  file_path: z.string(),
});

export const createInterviewSessionSchema = z.object({
  user_id: uuidSchema,
  skill_sheet_id: uuidSchema,
});

export const createQuestionSchema = z.object({
  session_id: uuidSchema,
  question_type: z.enum(['self_introduction', 'motivation', 'technical', 'reverse']),
  question_order: z.number().min(1),
  question_data: questionDataSchema,
});

export const createAnswerSchema = z.object({
  question_id: uuidSchema,
  answer_data: answerDataSchema,
});

export const updateAnswerSchema = z.object({
  answer_id: uuidSchema,
  answer_data: answerDataSchema.partial(),
  answer_status: z.enum(['in_progress', 'completed', 'failed']).optional(),
});

// 音声処理用スキーマ
export const audioChunkSchema = z.object({
  data: z.instanceof(Buffer),
  timestamp: z.number(),
  session_id: uuidSchema,
});

export const transcriptionChunkSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1),
  timestamp: z.number(),
  is_final: z.boolean(),
});

// クエリ用スキーマ
export const getQuestionsSchema = z.object({
  session_id: uuidSchema,
});

export const getSessionSchema = z.object({
  session_id: uuidSchema,
});

export const getUserSchema = z.object({
  user_id: uuidSchema,
});

export const getSkillSheetSchema = z.object({
  skill_sheet_id: uuidSchema,
});

export const startTranscriptionSchema = z.object({
  session_id: uuidSchema,
  question_id: uuidSchema,
});

export const stopTranscriptionSchema = z.object({
  session_id: uuidSchema,
  question_id: uuidSchema,
});

// レスポンス用スキーマ
export const userResponseSchema = z.object({
  id: uuidSchema,
  email: z.string().email(),
  name: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const skillSheetResponseSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  file_path: z.string(),
  file_name: z.string(),
  skill_data: skillDataSchema,
  analysis_status: z.enum(['pending', 'processing', 'completed', 'failed']),
  created_at: z.date(),
  updated_at: z.date(),
});

export const interviewSessionResponseSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  skill_sheet_id: uuidSchema,
  session_status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  started_at: z.date().optional(),
  completed_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const questionResponseSchema = z.object({
  id: uuidSchema,
  session_id: uuidSchema,
  question_type: z.enum(['self_introduction', 'motivation', 'technical', 'reverse']),
  question_order: z.number(),
  question_data: questionDataSchema,
  created_at: z.date(),
});

export const answerResponseSchema = z.object({
  id: uuidSchema,
  question_id: uuidSchema,
  answer_data: answerDataSchema,
  answer_status: z.enum(['in_progress', 'completed', 'failed']),
  started_at: z.date(),
  completed_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});