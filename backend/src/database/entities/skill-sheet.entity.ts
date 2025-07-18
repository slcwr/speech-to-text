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
import { InterviewSession } from './interview-session.entity';

export interface SkillData {
  technical_skills: string[];
  experience_years: number;
  projects: {
    name: string;
    role: string;
    technologies: string[];
    duration_months: number;
  }[];
  strengths: string[];
  weaknesses: string[];
  problem_solving: {
    approach: string;
    examples: {
      situation: string;
      task: string;
      action: string;
      result: string;
    }[];
    methodologies: string[];
    collaboration_style: string;
  };
  certifications?: string[];
  education?: string;
  languages?: string[];
}

export enum AnalysisStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

registerEnumType(AnalysisStatus, {
  name: 'AnalysisStatus',
});

@ObjectType()
@Entity('skill_sheets')
@Index('IDX_skill_sheets_user_id', ['user_id'])
@Index('IDX_skill_sheets_analysis_status', ['analysis_status'])
@Index('IDX_skill_data_gin', ['skill_data'])
@Index('IDX_technical_skills_gin', ['skill_data'])
@Index('IDX_problem_solving_gin', ['skill_data'])
@Index('IDX_experience_years_btree', ['skill_data'])
@Index('IDX_senior_engineers', ['user_id'], { 
  where: "((skill_data->>'experience_years')::int) >= 5" 
})
export class SkillSheet {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ name: 'userId' })
  @Column({ type: 'uuid' })
  user_id: string;

  @Field({ name: 'filePath' })
  @Column({ type: 'varchar', length: 500 })
  file_path: string;

  @Field({ name: 'fileName' })
  @Column({ type: 'varchar', length: 255 })
  file_name: string;

  @Field(() => String, { name: 'skillData' })
  @Column({ type: 'jsonb' })
  skill_data: SkillData;

  @Field(() => AnalysisStatus, { name: 'analysisStatus' })
  @Column({
    type: 'varchar',
    length: 20,
    default: AnalysisStatus.PENDING,
  })
  analysis_status: AnalysisStatus;

  @Field({ name: 'createdAt' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @Field({ name: 'updatedAt' })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.skillSheets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => InterviewSession, (session) => session.skillSheet)
  interviewSessions: InterviewSession[];
}