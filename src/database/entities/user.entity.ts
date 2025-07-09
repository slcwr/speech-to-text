import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SkillSheet } from './skill-sheet.entity';
import { InterviewSession } from './interview-session.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relations
  @OneToMany(() => SkillSheet, (skillSheet) => skillSheet.user)
  skillSheets: SkillSheet[];

  @OneToMany(() => InterviewSession, (session) => session.user)
  interviewSessions: InterviewSession[];
}