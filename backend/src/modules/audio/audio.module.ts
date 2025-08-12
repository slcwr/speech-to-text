import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AudioController } from './audio.controller';
import { AudioService } from './audio.service';
import { FFmpegService } from './ffmpeg.service';
import { WebSocketSubscriptionsService } from './websocket-subscriptions.service';
import { InterviewAnswer } from '../../database/entities/interview-answer.entity';
import { InterviewQuestion } from '../../database/entities/interview-question.entity';
import { InterviewSession } from '../../database/entities/interview-session.entity';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InterviewAnswer,
      InterviewQuestion,
      InterviewSession,
    ]),
    GeminiModule,
  ],
  controllers: [AudioController],
  providers: [
    AudioService,
    FFmpegService,
    WebSocketSubscriptionsService,
  ],
  exports: [
    AudioService,
    FFmpegService,
    WebSocketSubscriptionsService,
  ],
})
export class AudioModule {}