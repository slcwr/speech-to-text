import { Field, ObjectType, Float, Int, ID } from '@nestjs/graphql';
import { RecommendationGrade } from '../../../database/entities/evaluation-report.entity';

@ObjectType()
export class TechnicalScores {
  @Field(() => Float, { description: 'Frontend technology score (0-100)' })
  frontend: number;

  @Field(() => Float, { description: 'Backend technology score (0-100)' })
  backend: number;

  @Field(() => Float, { description: 'Database technology score (0-100)' })
  database: number;

  @Field(() => Float, { description: 'Infrastructure score (0-100)' })
  infrastructure: number;

  @Field(() => Float, { description: 'Architecture design score (0-100)' })
  architecture: number;
}

@ObjectType()
export class SoftSkillsScores {
  @Field(() => Float, { description: 'Communication skills score (0-100)' })
  communication: number;

  @Field(() => Float, { description: 'Problem solving skills score (0-100)' })
  problemSolving: number;

  @Field(() => Float, { description: 'Teamwork skills score (0-100)' })
  teamwork: number;

  @Field(() => Float, { description: 'Leadership skills score (0-100)' })
  leadership: number;

  @Field(() => Float, { description: 'Learning ability score (0-100)' })
  learning: number;
}

@ObjectType()
export class AnswerQualityScores {
  @Field(() => Float, { description: 'Technical accuracy score (0-100)' })
  accuracy: number;

  @Field(() => Float, { description: 'Answer detail level score (0-100)' })
  detail: number;

  @Field(() => Float, { description: 'Communication clarity score (0-100)' })
  clarity: number;

  @Field(() => Float, { description: 'Answer structure score (0-100)' })
  structure: number;
}

@ObjectType()
export class ExperienceEvaluation {
  @Field(() => Float, { description: 'Project scale experience score (0-100)' })
  projectScale: number;

  @Field(() => Float, { description: 'Role responsibility score (0-100)' })
  responsibility: number;

  @Field(() => Float, { description: 'Achievements score (0-100)' })
  achievements: number;

  @Field(() => Float, { description: 'Experience relevance score (0-100)' })
  relevance: number;
}

@ObjectType()
export class AIAnalysisMetadata {
  @Field(() => String, { description: 'AI model used for analysis' })
  modelUsed: string;

  @Field(() => String, { description: 'Analysis timestamp' })
  analysisTimestamp: string;

  @Field(() => String, { description: 'Confidence scores as JSON string' })
  confidenceScores: string;
}

@ObjectType()
export class EvaluationReportResponse {
  @Field(() => ID, { description: 'Report ID' })
  id: string;

  @Field(() => ID, { description: 'Session ID' })
  sessionId: string;

  @Field(() => TechnicalScores, { description: 'Technical skills evaluation' })
  technicalScores: TechnicalScores;

  @Field(() => SoftSkillsScores, { description: 'Soft skills evaluation' })
  softSkillsScores: SoftSkillsScores;

  @Field(() => AnswerQualityScores, { description: 'Answer quality evaluation' })
  answerQualityScores: AnswerQualityScores;

  @Field(() => ExperienceEvaluation, { description: 'Experience and achievements evaluation' })
  experienceEvaluation: ExperienceEvaluation;

  @Field(() => Float, { description: 'Overall evaluation score (0-100)' })
  overallScore: number;

  @Field(() => String, { description: 'Recommendation grade (A-E)' })
  recommendationGrade: string;

  @Field(() => [String], { description: 'Top strengths identified' })
  strengths: string[];

  @Field(() => [String], { description: 'Areas for improvement' })
  areasForImprovement: string[];

  @Field(() => String, { description: 'Detailed feedback text' })
  detailedFeedback: string;

  @Field(() => [String], { description: 'Recommended positions' })
  recommendedPositions: string[];

  @Field(() => AIAnalysisMetadata, { description: 'AI analysis metadata' })
  aiAnalysisMetadata: AIAnalysisMetadata;

  @Field(() => String, { description: 'Report creation timestamp' })
  createdAt: string;
}