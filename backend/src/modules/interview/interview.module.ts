import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewResolver } from './interview.resolver';
import { InterviewService } from './interview.service';
import { PdfService } from './pdf.service';
import { AudioModule } from '../audio/audio.module';
import { GeminiModule } from '../gemini/gemini.module';
import {
  InterviewSession,
  InterviewQuestion,
  InterviewAnswer,
  SkillSheet,
  User,
} from '../../database/entities';
import { EvaluationReport } from '../../database/entities/evaluation-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InterviewSession,
      InterviewQuestion,
      InterviewAnswer,
      SkillSheet,
      User,
      EvaluationReport,
    ]),
    AudioModule,
    GeminiModule,
  ],
  providers: [InterviewResolver, InterviewService, PdfService],
  exports: [InterviewService],
})
export class InterviewModule {}