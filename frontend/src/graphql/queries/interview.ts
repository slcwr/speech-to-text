import { gql } from '@apollo/client';

// 実際にバックエンドに存在するクエリのみ

export const GET_LATEST_SESSION = gql`
  query GetLatestSession {
    getLatestSession {
      id
      userId
      skillSheetId
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
      userId
      fileName
      filePath
      skillData
      analysisStatus
      createdAt
      updatedAt
    }
  }
`;

export const GET_INTERVIEW_SESSION = gql`
  query GetInterviewSession($sessionId: String!) {
    interviewSession(sessionId: $sessionId) {
      id
      userId
      skillSheetId
      sessionStatus
      startedAt
      completedAt
      createdAt
      updatedAt
      questions {
        id
        sessionId
        question_data
        question_order
        question_type
        created_at
      }
      skillSheet {
        id
        fileName
        filePath
        skillData
        analysisStatus
        createdAt
        updatedAt
      }
    }
  }
`;