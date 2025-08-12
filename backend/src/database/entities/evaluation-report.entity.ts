import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InterviewSession } from './interview-session.entity';

export enum RecommendationGrade {
  A = 'A', // 強く推奨
  B = 'B', // 推奨
  C = 'C', // 条件付き推奨
  D = 'D', // 要検討
  E = 'E', // 非推奨
}

@Entity('evaluation_reports')
export class EvaluationReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id' })
  session_id: string;

  @ManyToOne(() => InterviewSession)
  @JoinColumn({ name: 'session_id' })
  session: InterviewSession;

  @Column('jsonb', { name: 'technical_scores' })
  technicalScores: {
    frontend: number;
    backend: number;
    database: number;
    infrastructure: number;
    architecture: number;
  };

  @Column('jsonb', { name: 'soft_skills_scores' })
  softSkillsScores: {
    communication: number;
    problemSolving: number;
    teamwork: number;
    leadership: number;
    learning: number;
  };

  @Column('jsonb', { name: 'answer_quality_scores' })
  answerQualityScores: {
    accuracy: number;
    detail: number;
    clarity: number;
    structure: number;
  };

  @Column('jsonb', { name: 'experience_evaluation' })
  experienceEvaluation: {
    projectScale: number;
    responsibility: number;
    achievements: number;
    relevance: number;
  };

  @Column({ name: 'overall_score', type: 'decimal', precision: 3, scale: 1 })
  overallScore: number;

  @Column({
    name: 'recommendation_grade',
    type: 'enum',
    enum: RecommendationGrade,
  })
  recommendationGrade: RecommendationGrade;

  @Column('text', { name: 'strengths', array: true })
  strengths: string[];

  @Column('text', { name: 'areas_for_improvement', array: true })
  areasForImprovement: string[];

  @Column('text', { name: 'detailed_feedback' })
  detailedFeedback: string;

  @Column('text', { name: 'recommended_positions', array: true })
  recommendedPositions: string[];

  @Column('jsonb', { name: 'ai_analysis_metadata' })
  aiAnalysisMetadata: {
    modelUsed: string;
    analysisTimestamp: Date;
    confidenceScores: Record<string, number>;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}