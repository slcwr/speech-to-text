import { gql } from '@apollo/client';

export const INTERVIEW_SESSION_FRAGMENT = gql`
  fragment InterviewSessionFields on InterviewSession {
    id
    userId
    status
    startedAt
    endedAt
    totalQuestions
    completedQuestions
    averageScore
    createdAt
    updatedAt
  }
`;

export const INTERVIEW_QUESTION_FRAGMENT = gql`
  fragment InterviewQuestionFields on InterviewQuestion {
    id
    sessionId
    questionText
    category
    difficulty
    expectedAnswer
    hints
    order
    createdAt
  }
`;

export const INTERVIEW_ANSWER_FRAGMENT = gql`
  fragment InterviewAnswerFields on InterviewAnswer {
    id
    questionId
    answerText
    score
    feedback
    timeSpent
    createdAt
  }
`;

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