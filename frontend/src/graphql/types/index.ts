// GraphQL基本型定義
export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewSession {
  id: string;
  userId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  startedAt?: Date;
  endedAt?: Date;
  totalQuestions: number;
  completedQuestions: number;
  averageScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewQuestion {
  id: string;
  sessionId: string;
  questionText: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedAnswer?: string;
  hints?: string[];
  order: number;
  createdAt: Date;
}

export interface InterviewAnswer {
  id: string;
  questionId: string;
  answerText: string;
  score?: number;
  feedback?: string;
  timeSpent?: number;
  createdAt: Date;
}

export interface SkillSheet {
  id: string;
  userId: string;
  fileName: string;
  filePath: string;
  skillData: any;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

// Input型定義
export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface CreateInterviewSessionInput {
  skillSheetId?: string;
  questionCount?: number;
  categories?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface SubmitAnswerInput {
  questionId: string;
  answerText: string;
  timeSpent?: number;
}

export interface UpdateAnswerInput {
  answerText: string;
}

export interface UploadSkillSheetInput {
  file: File;
  fileName: string;
}

export interface GenerateQuestionsInput {
  skillSheetId: string;
  questionCount: number;
  categories?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

// レスポンス型定義
export interface AuthResponse {
  token: string;
  user: User;
}

export interface ValidationResponse {
  valid: boolean;
  user?: User;
}

export interface ActionResponse {
  success: boolean;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

export interface InterviewStatistics {
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  totalTimeSpent: number;
  categoryScores: CategoryScore[];
}

export interface CategoryScore {
  category: string;
  averageScore: number;
  totalQuestions: number;
}