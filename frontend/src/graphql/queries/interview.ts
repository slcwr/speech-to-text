import { gql } from '@apollo/client';
import { 
  INTERVIEW_SESSION_FRAGMENT, 
  INTERVIEW_QUESTION_FRAGMENT, 
  INTERVIEW_ANSWER_FRAGMENT,
  SKILL_SHEET_FRAGMENT 
} from '../fragments/interview';

export const GET_INTERVIEW_SESSIONS = gql`
  query GetInterviewSessions($userId: ID!, $limit: Int, $offset: Int) {
    interviewSessions(userId: $userId, limit: $limit, offset: $offset) {
      sessions {
        ...InterviewSessionFields
      }
      total
      hasMore
    }
  }
  ${INTERVIEW_SESSION_FRAGMENT}
`;

export const GET_INTERVIEW_SESSION = gql`
  query GetInterviewSession($id: ID!) {
    interviewSession(id: $id) {
      ...InterviewSessionFields
      questions {
        ...InterviewQuestionFields
        answer {
          ...InterviewAnswerFields
        }
      }
    }
  }
  ${INTERVIEW_SESSION_FRAGMENT}
  ${INTERVIEW_QUESTION_FRAGMENT}
  ${INTERVIEW_ANSWER_FRAGMENT}
`;

export const GET_INTERVIEW_QUESTIONS = gql`
  query GetInterviewQuestions($sessionId: ID!) {
    interviewQuestions(sessionId: $sessionId) {
      ...InterviewQuestionFields
      answer {
        ...InterviewAnswerFields
      }
    }
  }
  ${INTERVIEW_QUESTION_FRAGMENT}
  ${INTERVIEW_ANSWER_FRAGMENT}
`;

export const GET_SKILL_SHEETS = gql`
  query GetSkillSheets($userId: ID!, $limit: Int, $offset: Int) {
    skillSheets(userId: $userId, limit: $limit, offset: $offset) {
      sheets {
        ...SkillSheetFields
      }
      total
      hasMore
    }
  }
  ${SKILL_SHEET_FRAGMENT}
`;

export const GET_SKILL_SHEET = gql`
  query GetSkillSheet($id: ID!) {
    skillSheet(id: $id) {
      ...SkillSheetFields
    }
  }
  ${SKILL_SHEET_FRAGMENT}
`;

export const GET_INTERVIEW_STATISTICS = gql`
  query GetInterviewStatistics($userId: ID!) {
    interviewStatistics(userId: $userId) {
      totalSessions
      completedSessions
      averageScore
      totalTimeSpent
      categoryScores {
        category
        averageScore
        totalQuestions
      }
    }
  }
`;

export const GET_LATEST_SESSION = gql`
  query GetLatestSession {
    getLatestSession {
      id
      sessionStatus
      startedAt
      completedAt
      createdAt
      updatedAt
      skillSheet {
        id
        fileName
        analysisStatus
        createdAt
      }
    }
  }
`;

export const GET_MY_SKILL_SHEETS = gql`
  query GetMySkillSheets {
    getMySkillSheets {
      id
      fileName
      filePath
      analysisStatus
      createdAt
      updatedAt
    }
  }
`;