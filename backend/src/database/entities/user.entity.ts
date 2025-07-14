import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { SkillSheet } from './skill-sheet.entity';
import { InterviewSession } from './interview-session.entity';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Field()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Field()
  @Column({ type: 'varchar', length: 20, default: 'user' })
  role: string;

  @Field({ nullable: true })
  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLoginAt: Date;

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => SkillSheet, (skillSheet) => skillSheet.user)
  skillSheets: SkillSheet[];

  @OneToMany(() => InterviewSession, (session) => session.user)
  interviewSessions: InterviewSession[];
}