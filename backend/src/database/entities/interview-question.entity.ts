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
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
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

registerEnumType(QuestionType, {
  name: 'QuestionType',
});

@ObjectType()
@Entity('interview_questions')
@Index('IDX_interview_questions_sessionId', ['sessionId'])
@Index('IDX_interview_questions_type', ['question_type'])
@Index('IDX_interview_questions_order', ['sessionId', 'question_order'])
export class InterviewQuestion {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'uuid' })
  sessionId: string;

  @Field(() => QuestionType)
  @Column({ type: 'varchar', length: 20 })
  question_type: QuestionType;

  @Field()
  @Column({ type: 'int' })
  question_order: number;

  @Field(() => String)
  @Column({ type: 'jsonb' })
  question_data: QuestionData;

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  // Relations
  @ManyToOne(() => InterviewSession, (session) => session.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: InterviewSession;

  @Field(() => InterviewAnswer, { nullable: true })
  @OneToOne(() => InterviewAnswer, (answer) => answer.question)
  answer: InterviewAnswer;
}