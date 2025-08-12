import { gql } from '@apollo/client';

export const START_INTERVIEW = gql`
  mutation StartInterview($input: StartInterviewInput!) {
    startInterview(input: $input) {
      sessionId
      status
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
      startedAt
    }
  }
`;

export interface StartInterviewInput {
  sessionId: string;
}

export interface InterviewQuestion {
  id: string;
  sessionId: string;
  question: string;
  orderNumber: number;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface StartInterviewResponse {
  startInterview: {
    sessionId: string;
    status: string;
    currentQuestion: InterviewQuestion;
    allQuestions: InterviewQuestion[];
    startedAt: string;
  };
}