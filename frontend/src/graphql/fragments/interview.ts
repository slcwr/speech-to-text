import { gql } from '@apollo/client';

// InterviewSession fragment - バックエンドのschema.gqlのInterviewSession型に対応
export const INTERVIEW_SESSION_FRAGMENT = gql`
  fragment InterviewSessionFields on InterviewSession {
    id
    userId
    skillSheetId
    sessionStatus
    startedAt
    completedAt
    createdAt
    updatedAt
  }
`;

// InterviewQuestionResponse fragment
export const INTERVIEW_QUESTION_FRAGMENT = gql`
  fragment InterviewQuestionFields on InterviewQuestionResponse {
    id
    sessionId
    question
    orderNumber
    metadata
    createdAt
    updatedAt
  }
`;

// InterviewAnswer fragment - バックエンドのschema.gqlのInterviewAnswer型に対応
export const INTERVIEW_ANSWER_FRAGMENT = gql`
  fragment InterviewAnswerFields on InterviewAnswer {
    id
    question_id
    answer_data
    answer_status
    started_at
    completed_at
    created_at
    updated_at
  }
`;

// SkillSheet fragment - バックエンドのschema.gqlのSkillSheet型に対応
export const SKILL_SHEET_FRAGMENT = gql`
  fragment SkillSheetFields on SkillSheet {
    id
    userId
    fileName
    filePath
    skillData
    analysisStatus
    createdAt
    updatedAt
  }
`;