import {
  Controller,
  Post,
  UseGuards,
  Req,
  Body,
  Headers,
  BadRequestException,
  InternalServerErrorException,
  RawBodyRequest,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AudioService } from './audio.service';

/**
 * 音声ストリーミングとリアルタイム転写を処理するコントローラー
 */
@Controller('api/audio')
@UseGuards(JwtAuthGuard)
export class AudioController {
  constructor(private audioService: AudioService) {}

  /**
   * 音声チャンクをストリーミングして転写する
   * シーケンス図の207-227行に対応
   */
  @Post('stream')
  async streamAudioChunk(
    @Headers('sessionId') sessionId: string,
    @Headers('questionId') questionId: string,
    @Headers('content-type') contentType: string,
    @Req() req: RawBodyRequest<Request> & { user: any },
  ) {
    if (!sessionId || !questionId) {
      throw new BadRequestException('Missing sessionId or questionId in headers');
    }

    const audioData = req.rawBody;
    if (!audioData || !Buffer.isBuffer(audioData)) {
      throw new BadRequestException('Invalid audio data');
    }

    const userId = req.user.id;

    try {
      // 音声チャンクを処理して転写結果を取得
      const transcription = await this.audioService.processAudioChunk(
        audioData,
        contentType,
        userId,
        sessionId,
        questionId,
      );

      return {
        success: true,
        transcription,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Audio streaming error:', error);
      throw new InternalServerErrorException(
        `Failed to process audio chunk: ${error.message}`,
      );
    }
  }

  /**
   * 録音完了時の最終処理
   * シーケンス図の230-241行に対応
   */
  @Post('complete')
  async completeRecording(
    @Body('questionId') questionId: string,
    @Body('sessionId') sessionId: string,
    @Req() req: any,
  ) {
    if (!questionId || !sessionId) {
      throw new BadRequestException('Missing questionId or sessionId');
    }

    const userId = req.user.id;

    try {
      // 回答を完了し、次の質問を取得
      const result = await this.audioService.completeAnswer(
        userId,
        sessionId,
        questionId,
      );
      console.log('質問2の後確認:', result);

      return {
        success: true,
        nextQuestion: result.nextQuestion,
        isInterviewComplete: result.isInterviewComplete,
      };
    } catch (error) {
      console.error('Complete recording error:', error);
      throw new InternalServerErrorException(
        `Failed to complete recording: ${error.message}`,
      );
    }
  }
}