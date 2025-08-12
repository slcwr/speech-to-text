// 共通型定義
export interface SkillData {
  technical_skills: string[];
  experience_years: number;
  projects: {
    name: string;
    role: string;
    technologies: string[];
    duration_months: number;
  }[];
  strengths: string[];
  weaknesses: string[];
  problem_solving: {
    approach: string;
    examples: {
      situation: string;
      task: string;
      action: string;
      result: string;
    }[];
    methodologies: string[];
    collaboration_style: string;
  };
  certifications?: string[];
  education?: string;
  languages?: string[];
}

export interface QuestionData {
  text: string;
  audio_url?: string;
  duration_seconds?: number;
  metadata: {
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    based_on_skills?: string[];
    based_on_problem_solving?: boolean;
  };
}

export interface AnswerData {
  text: string;
  confidence_score: number;
  transcription_segments: {
    start_time: number;
    end_time: number;
    text: string;
    confidence: number;
  }[];
  audio_metadata: {
    duration_seconds: number;
    sample_rate: number;
    channels: number;
  };
  analysis: {
    key_points: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    fluency_score: number;
    problem_solving_indicators?: string[];
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface SkillSheet {
  id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  skill_data: SkillData;
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: Date;
  updated_at: Date;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  skill_sheet_id: string;
  session_status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  started_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface InterviewQuestion {
  id: string;
  sessionId: string;
  question_type: 'self_introduction' | 'motivation' | 'technical' | 'reverse';
  question_order: number;
  question_data: QuestionData;
  created_at: Date;
}

export interface InterviewAnswer {
  id: string;
  question_id: string;
  answer_data: AnswerData;
  answer_status: 'in_progress' | 'completed' | 'failed';
  started_at: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// リアルタイム音声処理用の型
export interface AudioChunk {
  data: Buffer;
  timestamp: number;
  sessionId: string;
}

export interface TranscriptionChunk {
  text: string;
  confidence: number;
  timestamp: number;
  is_final: boolean;
}