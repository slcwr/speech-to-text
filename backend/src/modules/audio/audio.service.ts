import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewAnswer } from '../../database/entities/interview-answer.entity';
import { InterviewQuestion } from '../../database/entities/interview-question.entity';
import { InterviewSession } from '../../database/entities/interview-session.entity';
import { GeminiService } from '../gemini/gemini.service';
import { FFmpegService } from './ffmpeg.service';
import { WebSocketSubscriptionsService } from './websocket-subscriptions.service';

/**
 * 音声処理とリアルタイム転写を行うサービス
 */
@Injectable()
export class AudioService {
  constructor(
    @InjectRepository(InterviewAnswer)
    private answerRepository: Repository<InterviewAnswer>,
    @InjectRepository(InterviewQuestion)
    private questionRepository: Repository<InterviewQuestion>,
    @InjectRepository(InterviewSession)
    private sessionRepository: Repository<InterviewSession>,
    private geminiService: GeminiService,
    private ffmpegService: FFmpegService,
    private wsSubscriptions: WebSocketSubscriptionsService,
  ) {}

  /**
   * 音声チャンクを処理してリアルタイム転写を行う
   * @param audioBuffer 音声データ
   * @param contentType 音声のMIMEタイプ
   * @param userId ユーザーID
   * @param sessionId セッションID
   * @param questionId 質問ID
   * @returns 転写結果
   */
  async processAudioChunk(
    audioBuffer: Buffer,
    contentType: string,
    userId: string,
    sessionId: string,
    questionId: string,
  ): Promise<string> {
    try {
      // 1. FFmpegで音声をWAV形式に変換
      const wavBuffer = await this.ffmpegService.convertToWav(
        audioBuffer,
        contentType,
      );

      // 2. Gemini APIで音声転写
      const transcription = await this.geminiService.transcribeAudio(wavBuffer);

      // 3. 転写結果をデータベースに追加保存
      if (transcription && transcription.trim()) {
        await this.appendTranscription(questionId, transcription);

        // 4. WebSocketで転写結果をリアルタイム送信
        await this.wsSubscriptions.publishAudioTranscription({
          sessionId,
          questionId,
          transcription,
          timestamp: new Date().toISOString(),
          userId,
        });
      }

      return transcription;
    } catch (error) {
      console.error('Audio chunk processing error:', error);
      throw new Error(`Failed to process audio chunk: ${error.message}`);
    }
  }

  /**
   * 転写結果を既存の回答に追加する
   * @param questionId 質問ID
   * @param transcription 転写テキスト
   */
  private async appendTranscription(
    questionId: string,
    transcription: string,
  ): Promise<void> {
    try {
      // 既存の回答を取得または作成
      let answer = await this.answerRepository.findOne({
        where: { question_id: questionId },
      });

      if (!answer) {
        // 新しい回答レコードを作成
        answer = this.answerRepository.create({
          question_id: questionId,
          answer_data: {
            text: transcription,
            confidence_score: 0.8,
            transcription_segments: [],
            audio_metadata: {
              duration_seconds: 0,
              sample_rate: 16000,
              channels: 1,
            },
            analysis: {
              key_points: [],
              sentiment: 'neutral',
              fluency_score: 0,
              problem_solving_indicators: [],
            },
          },
          answer_status: 'in_progress' as any,
        });
      } else {
        // 既存の回答に追加
        const currentText = answer.answer_data.text || '';
        answer.answer_data = {
          ...answer.answer_data,
          text: currentText + ' ' + transcription,
        };
        answer.updated_at = new Date();
      }

      await this.answerRepository.save(answer);
    } catch (error) {
      console.error('Failed to append transcription:', error);
      throw error;
    }
  }

  /**
   * 回答を完了し、次の質問を取得する
   * @param userId ユーザーID
   * @param sessionId セッションID
   * @param questionId 現在の質問ID
   * @returns 次の質問データ
   */
  async completeAnswer(
    userId: string,
    sessionId: string,
    questionId: string,
  ): Promise<{
    nextQuestion?: InterviewQuestion;
    isInterviewComplete: boolean;
  }> {
    try {
      // 1. 現在の回答を完了状態に更新
      const answer = await this.answerRepository.findOne({
        where: { question_id: questionId },
      });

      if (answer) {
        answer.answer_status = 'completed' as any;
        answer.completed_at = new Date();
        await this.answerRepository.save(answer);
      }

      // 2. 次の質問を取得
      const currentQuestion = await this.questionRepository.findOne({
        where: { id: questionId },
      });

      if (!currentQuestion) {
        throw new Error('Current question not found');
      }

      // 次の順序の質問を検索
      const nextQuestion = await this.questionRepository.findOne({
        where: {
          sessionId: sessionId,
          question_order: currentQuestion.question_order + 1,
        },
      });

      // 3. インタビューの完了判定
      const isInterviewComplete = !nextQuestion;

      if (isInterviewComplete) {
        // セッションの状態を完了に更新
        await this.sessionRepository.update(
          { id: sessionId },
          { 
            session_status: 'completed' as any,
            completed_at: new Date(),
          },
        );
      }

      console.log("次の質問:", nextQuestion);

      return {
        nextQuestion,
        isInterviewComplete,
      };
    } catch (error) {
      console.error('Failed to complete answer:', error);
      throw error;
    }
  }

  /**
   * セッションの全質問数を取得する
   * @param sessionId セッションID
   * @returns 質問数
   */
  async getTotalQuestions(sessionId: string): Promise<number> {
    return await this.questionRepository.count({
      where: { sessionId: sessionId },
    });
  }

  /**
   * 完了済み質問数を取得する
   * @param sessionId セッションID
   * @returns 完了済み質問数
   */
  async getCompletedQuestions(sessionId: string): Promise<number> {
    const completedAnswers = await this.answerRepository
      .createQueryBuilder('answer')
      .innerJoin('answer.question', 'question')
      .where('question.sessionId = :sessionId', { sessionId })
      .andWhere('answer.answer_status = :status', { status: 'completed' })
      .getCount();

    return completedAnswers;
  }
}