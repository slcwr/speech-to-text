import { gql } from '@apollo/client';
import { 
  INTERVIEW_SESSION_FRAGMENT, 
  INTERVIEW_QUESTION_FRAGMENT, 
  INTERVIEW_ANSWER_FRAGMENT,
  SKILL_SHEET_FRAGMENT 
} from '../fragments/interview';

export const CREATE_INTERVIEW_SESSION = gql`
  mutation CreateInterviewSession($input: CreateInterviewSessionInput!) {
    createInterviewSession(input: $input) {
      ...InterviewSessionFields
    }
  }
  ${INTERVIEW_SESSION_FRAGMENT}
`;

export const START_INTERVIEW_SESSION = gql`
  mutation StartInterviewSession($id: ID!) {
    startInterviewSession(id: $id) {
      ...InterviewSessionFields
      questions {
        ...InterviewQuestionFields
      }
    }
  }
  ${INTERVIEW_SESSION_FRAGMENT}
  ${INTERVIEW_QUESTION_FRAGMENT}
`;

export const END_INTERVIEW_SESSION = gql`
  mutation EndInterviewSession($id: ID!) {
    endInterviewSession(id: $id) {
      ...InterviewSessionFields
    }
  }
  ${INTERVIEW_SESSION_FRAGMENT}
`;

export const SUBMIT_INTERVIEW_ANSWER = gql`
  mutation SubmitInterviewAnswer($input: SubmitAnswerInput!) {
    submitInterviewAnswer(input: $input) {
      ...InterviewAnswerFields
    }
  }
  ${INTERVIEW_ANSWER_FRAGMENT}
`;

export const UPDATE_INTERVIEW_ANSWER = gql`
  mutation UpdateInterviewAnswer($id: ID!, $input: UpdateAnswerInput!) {
    updateInterviewAnswer(id: $id, input: $input) {
      ...InterviewAnswerFields
    }
  }
  ${INTERVIEW_ANSWER_FRAGMENT}
`;

export const UPLOAD_SKILL_SHEET = gql`
  mutation UploadSkillSheet($input: UploadSkillSheetInput!) {
    uploadSkillSheet(input: $input) {
      ...SkillSheetFields
    }
  }
  ${SKILL_SHEET_FRAGMENT}
`;

export const DELETE_SKILL_SHEET = gql`
  mutation DeleteSkillSheet($id: ID!) {
    deleteSkillSheet(id: $id) {
      success
      message
    }
  }
`;

export const ANALYZE_SKILL_SHEET = gql`
  mutation AnalyzeSkillSheet($id: ID!) {
    analyzeSkillSheet(id: $id) {
      ...SkillSheetFields
    }
  }
  ${SKILL_SHEET_FRAGMENT}
`;

export const GENERATE_INTERVIEW_QUESTIONS = gql`
  mutation GenerateInterviewQuestions($input: GenerateQuestionsInput!) {
    generateInterviewQuestions(input: $input) {
      questions {
        ...InterviewQuestionFields
      }
    }
  }
  ${INTERVIEW_QUESTION_FRAGMENT}
`;

export const DELETE_INTERVIEW_SESSION = gql`
  mutation DeleteInterviewSession($id: ID!) {
    deleteInterviewSession(id: $id) {
      success
      message
    }
  }
`;