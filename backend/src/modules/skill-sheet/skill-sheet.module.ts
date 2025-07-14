import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SkillSheet } from '../../database/entities/skill-sheet.entity';
import { User } from '../../database/entities/user.entity';
import { InterviewSession } from '../../database/entities/interview-session.entity';
import { InterviewQuestion } from '../../database/entities/interview-question.entity';
import { SkillSheetResolver } from './skill-sheet.resolver';
import { SkillSheetService } from './skill-sheet.service';
import { SkillSheetController } from './skill-sheet.controller';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SkillSheet, User, InterviewSession, InterviewQuestion]),
    GeminiModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'text/csv',
          'text/plain',
          'application/csv',
          'application/octet-stream',
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ];
        console.log('File MIME type:', file.mimetype);
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Invalid file type: ${file.mimetype}`), false);
        }
      },
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
      },
    }),
  ],
  providers: [SkillSheetResolver, SkillSheetService],
  controllers: [SkillSheetController],
  exports: [SkillSheetService],
})
export class SkillSheetModule {}