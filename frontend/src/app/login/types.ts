export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export enum AnalysisStatus {
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING'
}

export enum AnswerStatus {
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  IN_PROGRESS = 'IN_PROGRESS'
}

export type AudioTranscriptionSubscriptionResponse = {
  __typename?: 'AudioTranscriptionSubscriptionResponse';
  questionId: Scalars['String']['output'];
  sessionId: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
  transcription: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  token: Scalars['String']['output'];
  user: User;
};

export type CompleteAnswerInput = {
  /** Question ID */
  questionId: Scalars['String']['input'];
  /** Session ID */
  sessionId: Scalars['String']['input'];
};

export type CompleteAnswerResponse = {
  __typename?: 'CompleteAnswerResponse';
  isInterviewComplete: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  nextQuestion: Maybe<InterviewQuestionResponse>;
  progress: InterviewProgress;
};

export type InterviewAnswer = {
  __typename?: 'InterviewAnswer';
  answer_data: Scalars['String']['output'];
  answer_status: AnswerStatus;
  completed_at: Maybe<Scalars['DateTime']['output']>;
  created_at: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  question_id: Scalars['String']['output'];
  started_at: Scalars['DateTime']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export type InterviewProgress = {
  __typename?: 'InterviewProgress';
  completed: Scalars['Int']['output'];
  remaining: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type InterviewQuestion = {
  __typename?: 'InterviewQuestion';
  answer: Maybe<InterviewAnswer>;
  created_at: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  question_data: Scalars['String']['output'];
  question_order: Scalars['Float']['output'];
  question_type: QuestionType;
  sessionId: Scalars['String']['output'];
};

export type InterviewQuestionResponse = {
  __typename?: 'InterviewQuestionResponse';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  metadata: Maybe<Scalars['JSON']['output']>;
  orderNumber: Scalars['Int']['output'];
  question: Scalars['String']['output'];
  sessionId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type InterviewSession = {
  __typename?: 'InterviewSession';
  completedAt: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  questions: Array<InterviewQuestion>;
  sessionStatus: SessionStatus;
  skillSheet: SkillSheet;
  skillSheetId: Scalars['String']['output'];
  startedAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  completeAnswer: CompleteAnswerResponse;
  login: AuthResponse;
  register: AuthResponse;
  startInterview: StartInterviewResponse;
};


export type MutationCompleteAnswerArgs = {
  input: CompleteAnswerInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationStartInterviewArgs = {
  input: StartInterviewInput;
};

export type Query = {
  __typename?: 'Query';
  getLatestSession: Maybe<InterviewSession>;
  getMySkillSheets: Array<SkillSheet>;
  getSkillSheet: Maybe<SkillSheet>;
  interviewSession: InterviewSession;
  me: User;
  user: Maybe<User>;
};


export type QueryGetSkillSheetArgs = {
  id: Scalars['String']['input'];
};


export type QueryInterviewSessionArgs = {
  sessionId: Scalars['String']['input'];
};


export type QueryUserArgs = {
  id: Scalars['String']['input'];
};

export enum QuestionType {
  MOTIVATION = 'MOTIVATION',
  REVERSE = 'REVERSE',
  SELF_INTRODUCTION = 'SELF_INTRODUCTION',
  TECHNICAL = 'TECHNICAL'
}

export type RegisterInput = {
  email: Scalars['String']['input'];
  name: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
};

export enum SessionStatus {
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING'
}

export type SkillSheet = {
  __typename?: 'SkillSheet';
  analysisStatus: AnalysisStatus;
  createdAt: Scalars['DateTime']['output'];
  fileName: Scalars['String']['output'];
  filePath: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  skillData: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export type StartInterviewInput = {
  sessionId: Scalars['ID']['input'];
};

export type StartInterviewResponse = {
  __typename?: 'StartInterviewResponse';
  allQuestions: Array<InterviewQuestionResponse>;
  currentQuestion: InterviewQuestionResponse;
  sessionId: Scalars['ID']['output'];
  startedAt: Scalars['DateTime']['output'];
  status: Scalars['String']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  /** リアルタイム音声転写結果を受信する */
  audioTranscription: AudioTranscriptionSubscriptionResponse;
};


export type SubscriptionAudioTranscriptionArgs = {
  sessionId: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastLoginAt: Maybe<Scalars['DateTime']['output']>;
  name: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type InterviewSessionFieldsFragment = (
  { id: string, userId: string, skillSheetId: string, sessionStatus: SessionStatus, startedAt: string | null | undefined, completedAt: string | null | undefined, createdAt: string, updatedAt: string }
  & { __typename?: 'InterviewSession' }
);

export type InterviewQuestionFieldsFragment = (
  { id: string, sessionId: string, question: string, orderNumber: number, metadata: any | null | undefined, createdAt: string, updatedAt: string }
  & { __typename?: 'InterviewQuestionResponse' }
);

export type InterviewAnswerFieldsFragment = (
  { id: string, question_id: string, answer_data: string, answer_status: AnswerStatus, started_at: string, completed_at: string | null | undefined, created_at: string, updated_at: string }
  & { __typename?: 'InterviewAnswer' }
);

export type SkillSheetFieldsFragment = (
  { id: string, userId: string, fileName: string, filePath: string, skillData: string, analysisStatus: AnalysisStatus, createdAt: string, updatedAt: string }
  & { __typename?: 'SkillSheet' }
);

export type UserFieldsFragment = (
  { id: string, email: string, name: string | null | undefined, role: string, isActive: boolean, lastLoginAt: string | null | undefined, createdAt: string, updatedAt: string }
  & { __typename?: 'User' }
);

export type UserBasicFieldsFragment = (
  { id: string, email: string, name: string | null | undefined, role: string }
  & { __typename?: 'User' }
);

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = (
  { login: (
    { token: string, user: (
      UserBasicFieldsFragment
      & { __typename?: 'User' }
    ) }
    & { __typename?: 'AuthResponse' }
  ) }
  & { __typename?: 'Mutation' }
);

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type RegisterMutation = (
  { register: (
    { token: string, user: (
      UserBasicFieldsFragment
      & { __typename?: 'User' }
    ) }
    & { __typename?: 'AuthResponse' }
  ) }
  & { __typename?: 'Mutation' }
);

export type CompleteAnswerMutationVariables = Exact<{
  input: CompleteAnswerInput;
}>;


export type CompleteAnswerMutation = (
  { completeAnswer: (
    { isInterviewComplete: boolean, message: string, nextQuestion: (
      { id: string, sessionId: string, question: string, orderNumber: number, metadata: any | null | undefined, createdAt: string, updatedAt: string }
      & { __typename?: 'InterviewQuestionResponse' }
    ) | null | undefined, progress: (
      { completed: number, total: number, remaining: number }
      & { __typename?: 'InterviewProgress' }
    ) }
    & { __typename?: 'CompleteAnswerResponse' }
  ) }
  & { __typename?: 'Mutation' }
);

export type StartInterviewMutationVariables = Exact<{
  input: StartInterviewInput;
}>;


export type StartInterviewMutation = (
  { startInterview: (
    { sessionId: string, status: string, startedAt: string, currentQuestion: (
      { id: string, sessionId: string, question: string, orderNumber: number, metadata: any | null | undefined, createdAt: string, updatedAt: string }
      & { __typename?: 'InterviewQuestionResponse' }
    ), allQuestions: Array<(
      { id: string, sessionId: string, question: string, orderNumber: number, metadata: any | null | undefined, createdAt: string, updatedAt: string }
      & { __typename?: 'InterviewQuestionResponse' }
    )> }
    & { __typename?: 'StartInterviewResponse' }
  ) }
  & { __typename?: 'Mutation' }
);

export type GetCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentUserQuery = (
  { me: (
    UserBasicFieldsFragment
    & { __typename?: 'User' }
  ) }
  & { __typename?: 'Query' }
);

export type AudioTranscriptionSubscriptionVariables = Exact<{
  sessionId: Scalars['String']['input'];
}>;


export type AudioTranscriptionSubscription = (
  { audioTranscription: (
    { sessionId: string, questionId: string, transcription: string, timestamp: string, userId: string }
    & { __typename?: 'AudioTranscriptionSubscriptionResponse' }
  ) }
  & { __typename?: 'Subscription' }
);
