import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { SkillSheet } from './entities/skill-sheet.entity';
import { InterviewSession } from './entities/interview-session.entity';
import { InterviewQuestion } from './entities/interview-question.entity';
import { InterviewAnswer } from './entities/interview-answer.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'interview_system',
  synchronize: false, // 本番環境では false に設定
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    SkillSheet,
    InterviewSession,
    InterviewQuestion,
    InterviewAnswer,
  ],
  migrations: [
    __dirname + '/migrations/*.js',
  ],
  migrationsTableName: 'migrations',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false,
  } : false,
});