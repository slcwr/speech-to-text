/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
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
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Processing = 'PROCESSING'
}

export enum AnswerStatus {
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  InProgress = 'IN_PROGRESS'
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
  questionId: Scalars['String']['input'];
  sessionId: Scalars['String']['input'];
};

export type CompleteAnswerResponse = {
  __typename?: 'CompleteAnswerResponse';
  isInterviewComplete: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  nextQuestion?: Maybe<InterviewQuestionResponse>;
};

export type InterviewAnswer = {
  __typename?: 'InterviewAnswer';
  answer_data: Scalars['String']['output'];
  answer_status: AnswerStatus;
  completed_at?: Maybe<Scalars['DateTime']['output']>;
  created_at: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  question_id: Scalars['String']['output'];
  started_at: Scalars['DateTime']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export type InterviewQuestion = {
  __typename?: 'InterviewQuestion';
  answer?: Maybe<InterviewAnswer>;
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
  metadata?: Maybe<Scalars['JSON']['output']>;
  orderNumber: Scalars['Int']['output'];
  question: Scalars['String']['output'];
  sessionId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type InterviewSession = {
  __typename?: 'InterviewSession';
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  questions: Array<InterviewQuestion>;
  sessionStatus: SessionStatus;
  skillSheet: SkillSheet;
  skillSheetId: Scalars['String']['output'];
  startedAt?: Maybe<Scalars['DateTime']['output']>;
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
  getLatestSession?: Maybe<InterviewSession>;
  getMySkillSheets: Array<SkillSheet>;
  getSkillSheet?: Maybe<SkillSheet>;
  interviewSession: InterviewSession;
  me: User;
  user?: Maybe<User>;
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
  Motivation = 'MOTIVATION',
  Reverse = 'REVERSE',
  SelfIntroduction = 'SELF_INTRODUCTION',
  Technical = 'TECHNICAL'
}

export type RegisterInput = {
  email: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
};

export enum SessionStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  Pending = 'PENDING'
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
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type InterviewSessionFieldsFragment = { __typename?: 'InterviewSession', id: string, userId: string, skillSheetId: string, sessionStatus: SessionStatus, startedAt?: string | null, completedAt?: string | null, createdAt: string, updatedAt: string } & { ' $fragmentName'?: 'InterviewSessionFieldsFragment' };

export type InterviewQuestionFieldsFragment = { __typename?: 'InterviewQuestionResponse', id: string, sessionId: string, question: string, orderNumber: number, metadata?: any | null, createdAt: string, updatedAt: string } & { ' $fragmentName'?: 'InterviewQuestionFieldsFragment' };

export type InterviewAnswerFieldsFragment = { __typename?: 'InterviewAnswer', id: string, question_id: string, answer_data: string, answer_status: AnswerStatus, started_at: string, completed_at?: string | null, created_at: string, updated_at: string } & { ' $fragmentName'?: 'InterviewAnswerFieldsFragment' };

export type SkillSheetFieldsFragment = { __typename?: 'SkillSheet', id: string, userId: string, fileName: string, filePath: string, skillData: string, analysisStatus: AnalysisStatus, createdAt: string, updatedAt: string } & { ' $fragmentName'?: 'SkillSheetFieldsFragment' };

export type UserFieldsFragment = { __typename?: 'User', id: string, email: string, name?: string | null, role: string, isActive: boolean, lastLoginAt?: string | null, createdAt: string, updatedAt: string } & { ' $fragmentName'?: 'UserFieldsFragment' };

export type UserBasicFieldsFragment = { __typename?: 'User', id: string, email: string, name?: string | null, role: string } & { ' $fragmentName'?: 'UserBasicFieldsFragment' };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthResponse', token: string, user: (
      { __typename?: 'User' }
      & { ' $fragmentRefs'?: { 'UserBasicFieldsFragment': UserBasicFieldsFragment } }
    ) } };

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'AuthResponse', token: string, user: (
      { __typename?: 'User' }
      & { ' $fragmentRefs'?: { 'UserBasicFieldsFragment': UserBasicFieldsFragment } }
    ) } };

export type CompleteAnswerMutationVariables = Exact<{
  input: CompleteAnswerInput;
}>;


export type CompleteAnswerMutation = { __typename?: 'Mutation', completeAnswer: { __typename?: 'CompleteAnswerResponse', isInterviewComplete: boolean, message: string, nextQuestion?: { __typename?: 'InterviewQuestionResponse', id: string, sessionId: string, question: string, orderNumber: number, metadata?: any | null, createdAt: string, updatedAt: string } | null } };

export type StartInterviewMutationVariables = Exact<{
  input: StartInterviewInput;
}>;


export type StartInterviewMutation = { __typename?: 'Mutation', startInterview: { __typename?: 'StartInterviewResponse', sessionId: string, status: string, startedAt: string, currentQuestion: { __typename?: 'InterviewQuestionResponse', id: string, sessionId: string, question: string, orderNumber: number, metadata?: any | null, createdAt: string, updatedAt: string }, allQuestions: Array<{ __typename?: 'InterviewQuestionResponse', id: string, sessionId: string, question: string, orderNumber: number, metadata?: any | null, createdAt: string, updatedAt: string }> } };

export type GetCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentUserQuery = { __typename?: 'Query', me: (
    { __typename?: 'User' }
    & { ' $fragmentRefs'?: { 'UserBasicFieldsFragment': UserBasicFieldsFragment } }
  ) };

export type GetUserByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetUserByIdQuery = { __typename?: 'Query', user?: (
    { __typename?: 'User' }
    & { ' $fragmentRefs'?: { 'UserFieldsFragment': UserFieldsFragment } }
  ) | null };

export type GetUserProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserProfileQuery = { __typename?: 'Query', me: (
    { __typename?: 'User' }
    & { ' $fragmentRefs'?: { 'UserFieldsFragment': UserFieldsFragment } }
  ) };

export type AudioTranscriptionSubscriptionVariables = Exact<{
  sessionId: Scalars['String']['input'];
}>;


export type AudioTranscriptionSubscription = { __typename?: 'Subscription', audioTranscription: { __typename?: 'AudioTranscriptionSubscriptionResponse', sessionId: string, questionId: string, transcription: string, timestamp: string, userId: string } };

export const InterviewSessionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"InterviewSessionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InterviewSession"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"skillSheetId"}},{"kind":"Field","name":{"kind":"Name","value":"sessionStatus"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<InterviewSessionFieldsFragment, unknown>;
export const InterviewQuestionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"InterviewQuestionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InterviewQuestionResponse"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"question"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<InterviewQuestionFieldsFragment, unknown>;
export const InterviewAnswerFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"InterviewAnswerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InterviewAnswer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"question_id"}},{"kind":"Field","name":{"kind":"Name","value":"answer_data"}},{"kind":"Field","name":{"kind":"Name","value":"answer_status"}},{"kind":"Field","name":{"kind":"Name","value":"started_at"}},{"kind":"Field","name":{"kind":"Name","value":"completed_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<InterviewAnswerFieldsFragment, unknown>;
export const SkillSheetFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SkillSheetFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SkillSheet"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"filePath"}},{"kind":"Field","name":{"kind":"Name","value":"skillData"}},{"kind":"Field","name":{"kind":"Name","value":"analysisStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<SkillSheetFieldsFragment, unknown>;
export const UserFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"lastLoginAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<UserFieldsFragment, unknown>;
export const UserBasicFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasicFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]} as unknown as DocumentNode<UserBasicFieldsFragment, unknown>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasicFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasicFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasicFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasicFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const CompleteAnswerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteAnswer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CompleteAnswerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completeAnswer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nextQuestion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"question"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"isInterviewComplete"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<CompleteAnswerMutation, CompleteAnswerMutationVariables>;
export const StartInterviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartInterview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StartInterviewInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startInterview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"currentQuestion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"question"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"allQuestions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"question"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<StartInterviewMutation, StartInterviewMutationVariables>;
export const GetCurrentUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCurrentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasicFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasicFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]} as unknown as DocumentNode<GetCurrentUserQuery, GetCurrentUserQueryVariables>;
export const GetUserByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUserById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"lastLoginAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetUserByIdQuery, GetUserByIdQueryVariables>;
export const GetUserProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUserProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"lastLoginAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetUserProfileQuery, GetUserProfileQueryVariables>;
export const AudioTranscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"AudioTranscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"audioTranscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"questionId"}},{"kind":"Field","name":{"kind":"Name","value":"transcription"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}}]}}]}}]} as unknown as DocumentNode<AudioTranscriptionSubscription, AudioTranscriptionSubscriptionVariables>;