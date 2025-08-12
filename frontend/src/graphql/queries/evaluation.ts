import { gql } from '@apollo/client';

export const GET_EVALUATION_REPORT = gql`
  query GetEvaluationReport($reportId: String!) {
    getEvaluationReport(reportId: $reportId) {
      id
      sessionId
      technicalScores {
        frontend
        backend
        database
        infrastructure
        architecture
      }
      softSkillsScores {
        communication
        problemSolving
        teamwork
        leadership
        learning
      }
      answerQualityScores {
        accuracy
        detail
        clarity
        structure
      }
      experienceEvaluation {
        projectScale
        responsibility
        achievements
        relevance
      }
      overallScore
      recommendationGrade
      strengths
      areasForImprovement
      detailedFeedback
      recommendedPositions
    }
  }
`;

export const GET_REPORTS_BY_SESSION = gql`
  query GetReportsBySession($sessionId: String!) {
    getReportsBySession(sessionId: $sessionId) {
      id
      sessionId
      technicalScores {
        frontend
        backend
        database
        infrastructure
        architecture
      }
      softSkillsScores {
        communication
        problemSolving
        teamwork
        leadership
        learning
      }
      answerQualityScores {
        accuracy
        detail
        clarity
        structure
      }
      experienceEvaluation {
        projectScale
        responsibility
        achievements
        relevance
      }
      overallScore
      recommendationGrade
      strengths
      areasForImprovement
      detailedFeedback
      recommendedPositions
    }
  }
`;

export const GENERATE_EVALUATION_REPORT = gql`
  mutation GenerateEvaluationReport($input: GenerateEvaluationReportInput!) {
    generateEvaluationReport(input: $input) {
      id
      sessionId
      technicalScores {
        frontend
        backend
        database
        infrastructure
        architecture
      }
      softSkillsScores {
        communication
        problemSolving
        teamwork
        leadership
        learning
      }
      answerQualityScores {
        accuracy
        detail
        clarity
        structure
      }
      experienceEvaluation {
        projectScale
        responsibility
        achievements
        relevance
      }
      overallScore
      recommendationGrade
      strengths
      areasForImprovement
      detailedFeedback
      recommendedPositions
    }
  }
`;