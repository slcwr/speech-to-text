import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from './user.entity';
import { SkillSheet } from './skill-sheet.entity';
import { InterviewQuestion } from './interview-question.entity';

export enum SessionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

registerEnumType(SessionStatus, {
  name: 'SessionStatus',
});

@ObjectType()
@Entity('interview_sessions')
@Index('IDX_interview_sessions_user_id', ['user_id'])
@Index('IDX_interview_sessions_skill_sheet_id', ['skill_sheet_id'])
@Index('IDX_interview_sessions_status', ['session_status'])
@Index('IDX_completed_sessions', ['user_id'], { 
  where: "session_status = 'completed'" 
})
export class InterviewSession {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'uuid' })
  user_id: string;

  @Field()
  @Column({ type: 'uuid' })
  skill_sheet_id: string;

  @Field(() => SessionStatus)
  @Column({
    type: 'varchar',
    length: 20,
    default: SessionStatus.PENDING,
  })
  session_status: SessionStatus;

  @Field({ nullable: true })
  @Column({ type: 'timestamp with time zone', nullable: true })
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
  @ManyToOne(() => User, (user) => user.interviewSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => SkillSheet)
  @ManyToOne(() => SkillSheet, (skillSheet) => skillSheet.interviewSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_sheet_id' })
  skillSheet: SkillSheet;

  @Field(() => [InterviewQuestion])
  @OneToMany(() => InterviewQuestion, (question) => question.session)
  questions: InterviewQuestion[];
}