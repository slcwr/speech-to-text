import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { InterviewQuestion } from './interview-question.entity';

export interface AnswerData {
  text: string;
  confidence_score: number;
  transcription_segments: {
    start_time?: number;
    end_time?: number;
    text?: string;
    confidence?: number;
  }[];
  audio_metadata: {
    duration_seconds?: number;
    sample_rate?: number;
    channels?: number;
  };
  analysis: {
    key_points?: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';
    fluency_score?: number;
    problem_solving_indicators?: string[];
  };
}

export enum AnswerStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

registerEnumType(AnswerStatus, {
  name: 'AnswerStatus',
});

@ObjectType()
@Entity('interview_answers')
@Index('IDX_interview_answers_question_id', ['question_id'])
@Index('IDX_interview_answers_status', ['answer_status'])
@Index('IDX_answer_data_gin', ['answer_data'])
export class InterviewAnswer {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'uuid' })
  question_id: string;

  @Field(() => String)
  @Column({ type: 'jsonb' })
  answer_data: AnswerData;

  @Field(() => AnswerStatus)
  @Column({
    type: 'varchar',
    length: 20,
    default: AnswerStatus.IN_PROGRESS,
  })
  answer_status: AnswerStatus;

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  started_at: Date;

  @Field({ nullable: true })
  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_at: Date;

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relations
  @OneToOne(() => InterviewQuestion, (question) => question.answer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: InterviewQuestion;
}