import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewResolver } from './interview.resolver';
import { InterviewService } from './interview.service';
import { AudioModule } from '../audio/audio.module';
import {
  InterviewSession,
  InterviewQuestion,
  InterviewAnswer,
  SkillSheet,
  User,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InterviewSession,
      InterviewQuestion,
      InterviewAnswer,
      SkillSheet,
      User,
    ]),
    AudioModule,
  ],
  providers: [InterviewResolver, InterviewService],
  exports: [InterviewService],
})
export class InterviewModule {}