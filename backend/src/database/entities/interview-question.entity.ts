import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { InterviewSession } from './interview-session.entity';
import { InterviewAnswer } from './interview-answer.entity';

export interface QuestionData {
  text: string;
  audio_url?: string;
  duration_seconds?: number;
  metadata: {
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    based_on_skills?: string[];
    based_on_problem_solving?: boolean;
  };
}

export enum QuestionType {
  SELF_INTRODUCTION = 'self_introduction',
  MOTIVATION = 'motivation',
  TECHNICAL = 'technical',
  REVERSE = 'reverse',
}

@Entity('interview_questions')
@Index('IDX_interview_questions_session_id', ['session_id'])
@Index('IDX_interview_questions_type', ['question_type'])
@Index('IDX_interview_questions_order', ['session_id', 'question_order'])
export class InterviewQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  session_id: string;

  @Column({ type: 'varchar', length: 20 })
  question_type: QuestionType;

  @Column({ type: 'int' })
  question_order: number;

  @Column({ type: 'jsonb' })
  question_data: QuestionData;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  // Relations
  @ManyToOne(() => InterviewSession, (session) => session.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: InterviewSession;

  @OneToOne(() => InterviewAnswer, (answer) => answer.question)
  answer: InterviewAnswer;
}