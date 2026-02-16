import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User, SkillSheet, InterviewSession, InterviewQuestion, InterviewAnswer, EvaluationReport } from './entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'interview_db',
  synchronize: false, // 本番環境では false に設定
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    SkillSheet,
    InterviewSession,
    InterviewQuestion,
    InterviewAnswer,
    EvaluationReport,
  ],
  migrations: [
    __dirname + '/migrations/*.ts',
  ],
  migrationsTableName: 'migrations',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false,
  } : false,
});