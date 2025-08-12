/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  fragment InterviewSessionFields on InterviewSession {\n    id\n    userId\n    skillSheetId\n    sessionStatus\n    startedAt\n    completedAt\n    createdAt\n    updatedAt\n  }\n": typeof types.InterviewSessionFieldsFragmentDoc,
    "\n  fragment InterviewQuestionFields on InterviewQuestionResponse {\n    id\n    sessionId\n    question\n    orderNumber\n    metadata\n    createdAt\n    updatedAt\n  }\n": typeof types.InterviewQuestionFieldsFragmentDoc,
    "\n  fragment InterviewAnswerFields on InterviewAnswer {\n    id\n    question_id\n    answer_data\n    answer_status\n    started_at\n    completed_at\n    created_at\n    updated_at\n  }\n": typeof types.InterviewAnswerFieldsFragmentDoc,
    "\n  fragment SkillSheetFields on SkillSheet {\n    id\n    userId\n    fileName\n    filePath\n    skillData\n    analysisStatus\n    createdAt\n    updatedAt\n  }\n": typeof types.SkillSheetFieldsFragmentDoc,
    "\n  fragment UserFields on User {\n    id\n    email\n    name\n    role\n    isActive\n    lastLoginAt\n    createdAt\n    updatedAt\n  }\n": typeof types.UserFieldsFragmentDoc,
    "\n  fragment UserBasicFields on User {\n    id\n    email\n    name\n    role\n  }\n": typeof types.UserBasicFieldsFragmentDoc,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      token\n      user {\n        ...UserBasicFields\n      }\n    }\n  }\n  \n": typeof types.LoginDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      token\n      user {\n        ...UserBasicFields\n      }\n    }\n  }\n  \n": typeof types.RegisterDocument,
    "\n  mutation CompleteAnswer($input: CompleteAnswerInput!) {\n    completeAnswer(input: $input) {\n      nextQuestion {\n        id\n        sessionId\n        question\n        orderNumber\n        metadata\n        createdAt\n        updatedAt\n      }\n      isInterviewComplete\n      message\n    }\n  }\n": typeof types.CompleteAnswerDocument,
    "\n  mutation StartInterview($input: StartInterviewInput!) {\n    startInterview(input: $input) {\n      sessionId\n      status\n      startedAt\n      currentQuestion {\n        id\n        sessionId\n        question\n        orderNumber\n        metadata\n        createdAt\n        updatedAt\n      }\n      allQuestions {\n        id\n        sessionId\n        question\n        orderNumber\n        metadata\n        createdAt\n        updatedAt\n      }\n    }\n  }\n": typeof types.StartInterviewDocument,
    "\n  query GetCurrentUser {\n    me {\n      ...UserBasicFields\n    }\n  }\n  \n": typeof types.GetCurrentUserDocument,
    "\n  query GetUserById($id: String!) {\n    user(id: $id) {\n      ...UserFields\n    }\n  }\n  \n": typeof types.GetUserByIdDocument,
    "\n  query GetUserProfile {\n    me {\n      ...UserFields\n    }\n  }\n  \n": typeof types.GetUserProfileDocument,
    "\n  subscription AudioTranscription($sessionId: String!) {\n    audioTranscription(sessionId: $sessionId) {\n      sessionId\n      questionId\n      transcription\n      timestamp\n      userId\n    }\n  }\n": typeof types.AudioTranscriptionDocument,
};
const documents: Documents = {
    "\n  fragment InterviewSessionFields on InterviewSession {\n    id\n    userId\n    skillSheetId\n    sessionStatus\n    startedAt\n    completedAt\n    createdAt\n    updatedAt\n  }\n": types.InterviewSessionFieldsFragmentDoc,
    "\n  fragment InterviewQuestionFields on InterviewQuestionResponse {\n    id\n    sessionId\n    question\n    orderNumber\n    metadata\n    createdAt\n    updatedAt\n  }\n": types.InterviewQuestionFieldsFragmentDoc,
    "\n  fragment InterviewAnswerFields on InterviewAnswer {\n    id\n    question_id\n    answer_data\n    answer_status\n    started_at\n    completed_at\n    created_at\n    updated_at\n  }\n": types.InterviewAnswerFieldsFragmentDoc,
    "\n  fragment SkillSheetFields on SkillSheet {\n    id\n    userId\n    fileName\n    filePath\n    skillData\n    analysisStatus\n    createdAt\n    updatedAt\n  }\n": types.SkillSheetFieldsFragmentDoc,
    "\n  fragment UserFields on User {\n    id\n    email\n    name\n    role\n    isActive\n    lastLoginAt\n    createdAt\n    updatedAt\n  }\n": types.UserFieldsFragmentDoc,
    "\n  fragment UserBasicFields on User {\n    id\n    email\n    name\n    role\n  }\n": types.UserBasicFieldsFragmentDoc,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      token\n      user {\n        ...UserBasicFields\n      }\n    }\n  }\n  \n": types.LoginDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      token\n      user {\n        ...UserBasicFields\n      }\n    }\n  }\n  \n": types.RegisterDocument,
    "\n  mutation CompleteAnswer($input: CompleteAnswerInput!) {\n    completeAnswer(input: $input) {\n      nextQuestion {\n        id\n        sessionId\n        question\n        orderNumber\n        metadata\n        createdAt\n        updatedAt\n      }\n      isInterviewComplete\n      message\n    }\n  }\n": types.CompleteAnswerDocument,
    "\n  mutation StartInterview($input: StartInterviewInput!) {\n    startInterview(input: $input) {\n      sessionId\n      status\n      startedAt\n      currentQuestion {\n        id\n        sessionId\n        question\n        orderNumber\n        metadata\n        createdAt\n        updatedAt\n      }\n      allQuestions {\n        id\n        sessionId\n        question\n        orderNumber\n        metadata\n        createdAt\n        updatedAt\n      }\n    }\n  }\n": types.StartInterviewDocument,
    "\n  query GetCurrentUser {\n    me {\n      ...UserBasicFields\n    }\n  }\n  \n": types.GetCurrentUserDocument,
    "\n  query GetUserById($id: String!) {\n    user(id: $id) {\n      ...UserFields\n    }\n  }\n  \n": types.GetUserByIdDocument,
    "\n  query GetUserProfile {\n    me {\n      ...UserFields\n    }\n  }\n  \n": types.GetUserProfileDocument,
    "\n  subscription AudioTranscription($sessionId: String!) {\n    audioTranscription(sessionId: $sessionId) {\n      sessionId\n      questionId\n      transcription\n      timestamp\n      userId\n    }\n  }\n": types.AudioTranscriptionDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment InterviewSessionFields on InterviewSession {\n    id\n    userId\n    skillSheetId\n    sessionStatus\n    startedAt\n    completedAt\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment InterviewSessionFields on InterviewSession {\n    id\n    userId\n    skillSheetId\n    sessionStatus\n    startedAt\n    completedAt\n    createdAt\n    updatedAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment InterviewQuestionFields on InterviewQuestionResponse {\n    id\n    sessionId\n    question\n    orderNumber\n    metadata\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment InterviewQuestionFields on InterviewQuestionResponse {\n    id\n    sessionId\n    question\n    orderNumber\n    metadata\n    createdAt\n    updatedAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment InterviewAnswerFields on InterviewAnswer {\n    id\n    question_id\n    answer_data\n    answer_status\n    started_at\n    completed_at\n    created_at\n    updated_at\n  }\n"): (typeof documents)["\n  fragment InterviewAnswerFields on InterviewAnswer {\n    id\n    question_id\n    answer_data\n    answer_status\n    started_at\n    completed_at\n    created_at\n    updated_at\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment SkillSheetFields on SkillSheet {\n    id\n    userId\n    fileName\n    filePath\n    skillData\n    analysisStatus\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment SkillSheetFields on SkillSheet {\n    id\n    userId\n    fileName\n    filePath\n    skillData\n    analysisStatus\n    createdAt\n    updatedAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment UserFields on User {\n    id\n    email\n    name\n    role\n    isActive\n    lastLoginAt\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment UserFields on User {\n    id\n    email\n    name\n    role\n    isActive\n    lastLoginAt\n    createdAt\n    updatedAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment UserBasicFields on User {\n    id\n    email\n    name\n    role\n  }\n"): (typeof documents)["\n  fragment UserBasicFields on User {\n    id\n    email\n    name\n    role\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      token\n      user {\n        ...UserBasicFields\n      }\n    }\n  }\n  \n"): (typeof documents)["\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      token\n      user {\n        ...UserBasicFields\n      }\n    }\n  }\n  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      token\n      user {\n        ...UserBasicFields\n      }\n    }\n  }\n  \n"): (typeof documents)["\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      token\n      user {\n        ...UserBasicFields\n      }\n    }\n  }\n  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CompleteAnswer($input: CompleteAnswerInput!) {\n    completeAnswer(input: $input) {\n      nextQuestion {\n        id\n        sessionId\n        question\n        orderNumber\n        metadata\n        createdAt\n        updatedAt\n      }\n      isInterviewComplete\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation CompleteAnswer($input: CompleteAnswerInput!) {\n    completeAnswer(input: $input) {\n      nextQuestion {\n        id\n        sessionId\n        question\n        orderNumber\n        metadata\n        createdAt\n        updatedAt\n      }\n      isInterviewComplete\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation StartInterview($input: StartInterviewInput!) {\n    startInterview(input: $input) {\n      sessionId\n      status\n      startedAt\n      currentQuestion {\n        id\n        sessionId\n        question\n        orderNumber\n        metadata\n        createdAt\n        updatedAt\n      }\n      allQuestions {\n        id\n        sessionId\n        question\n        orderNumber\n        metadata\n        createdAt\n        updatedAt\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation StartInterview($input: StartInterviewInput!) {\n    startInterview(input: $input) {\n      sessionId\n      status\n      startedAt\n      currentQuestion {\n        id\n        sessionId\n        question\n        orderNumber\n        metadata\n        createdAt\n        updatedAt\n      }\n      allQuestions {\n        id\n        sessionId\n        question\n        orderNumber\n        metadata\n        createdAt\n        updatedAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCurrentUser {\n    me {\n      ...UserBasicFields\n    }\n  }\n  \n"): (typeof documents)["\n  query GetCurrentUser {\n    me {\n      ...UserBasicFields\n    }\n  }\n  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUserById($id: String!) {\n    user(id: $id) {\n      ...UserFields\n    }\n  }\n  \n"): (typeof documents)["\n  query GetUserById($id: String!) {\n    user(id: $id) {\n      ...UserFields\n    }\n  }\n  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUserProfile {\n    me {\n      ...UserFields\n    }\n  }\n  \n"): (typeof documents)["\n  query GetUserProfile {\n    me {\n      ...UserFields\n    }\n  }\n  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription AudioTranscription($sessionId: String!) {\n    audioTranscription(sessionId: $sessionId) {\n      sessionId\n      questionId\n      transcription\n      timestamp\n      userId\n    }\n  }\n"): (typeof documents)["\n  subscription AudioTranscription($sessionId: String!) {\n    audioTranscription(sessionId: $sessionId) {\n      sessionId\n      questionId\n      transcription\n      timestamp\n      userId\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;