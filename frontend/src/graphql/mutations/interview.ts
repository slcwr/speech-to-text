import { gql } from '@apollo/client';

// 実際にバックエンドに存在するmutationsのみを定義

// CompleteAnswer mutation - バックエンドのschema.gqlに定義されている
export const COMPLETE_ANSWER = gql`
  mutation CompleteAnswer($input: CompleteAnswerInput!) {
    completeAnswer(input: $input) {
      nextQuestion {
        id
        sessionId
        question
        orderNumber
        metadata
        createdAt
        updatedAt
      }
      isInterviewComplete
      message
    }
  }
`;

// StartInterview mutation - バックエンドのschema.gqlに定義されている
export const START_INTERVIEW = gql`
  mutation StartInterview($input: StartInterviewInput!) {
    startInterview(input: $input) {
      sessionId
      status
      startedAt
      currentQuestion {
        id
        sessionId
        question
        orderNumber
        metadata
        createdAt
        updatedAt
      }
      allQuestions {
        id
        sessionId
        question
        orderNumber
        metadata
        createdAt
        updatedAt
      }
    }
  }
`;

// TypeScript interface for the input
export interface CompleteAnswerInput {
  sessionId: string;
  questionId: string;
}