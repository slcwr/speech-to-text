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

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'varchar', length: 20, default: 'user' })
  role: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_login_at: Date;

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