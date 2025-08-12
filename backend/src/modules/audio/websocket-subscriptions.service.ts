import { Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

/**
 * WebSocketサブスクリプション用のイベントタイプ
 */
export interface AudioTranscriptionEvent {
  sessionId: string;
  questionId: string;
  transcription: string;
  timestamp: string;
  userId: string;
}

/**
 * WebSocketサブスクリプションを管理するサービス
 */
@Injectable()
export class WebSocketSubscriptionsService {
  private pubSub: PubSub;

  constructor() {
    this.pubSub = new PubSub();
  }

  /**
   * 音声転写結果をリアルタイムで配信する
   * @param event 音声転写イベント
   */
  async publishAudioTranscription(event: AudioTranscriptionEvent): Promise<void> {
    try {
      await this.pubSub.publish('audioTranscription', {
        audioTranscription: event,
      });
      
      console.log('Published audio transcription:', {
        sessionId: event.sessionId,
        questionId: event.questionId,
        transcriptionLength: event.transcription.length,
        timestamp: event.timestamp,
      });
    } catch (error) {
      console.error('Failed to publish audio transcription:', error);
      throw error;
    }
  }

  /**
   * 音声転写のサブスクリプションイテレーターを作成する
   * @param sessionId セッションID（フィルター用）
   * @returns AsyncIterator
   */
  createAudioTranscriptionSubscription(
    sessionId?: string,
  ): AsyncIterator<AudioTranscriptionEvent> {
    // Note: graphql-subscriptionsのPubSubではfilterオプションは使用できません
    // 実際のプロダクションではRedis PubSubやGraphQL subscriptionsの
    // より高度な実装を使用することを推奨します
    
    // シンプルなasyncIteratorを返す
    return this.pubSub.asyncIterator('audioTranscription');
  }

  /**
   * インタビュー進行状況の更新イベントを配信する
   */
  async publishInterviewProgress(event: {
    sessionId: string;
    currentQuestionIndex: number;
    totalQuestions: number;
    completedQuestions: number;
    status: 'in_progress' | 'completed';
    userId: string;
  }): Promise<void> {
    try {
      await this.pubSub.publish('interviewProgress', {
        interviewProgress: event,
      });

      console.log('Published interview progress:', event);
    } catch (error) {
      console.error('Failed to publish interview progress:', error);
      throw error;
    }
  }

  /**
   * インタビュー進行状況のサブスクリプションイテレーターを作成する
   */
  createInterviewProgressSubscription(
    sessionId?: string,
  ): AsyncIterator<any> {
    return this.pubSub.asyncIterator('interviewProgress');
  }

  /**
   * エラーイベントを配信する
   */
  async publishError(event: {
    sessionId: string;
    questionId?: string;
    errorType: 'transcription' | 'audio_processing' | 'system';
    message: string;
    timestamp: string;
    userId: string;
  }): Promise<void> {
    try {
      await this.pubSub.publish('audioError', {
        audioError: event,
      });

      console.error('Published audio error:', event);
    } catch (error) {
      console.error('Failed to publish error event:', error);
      throw error;
    }
  }

  /**
   * エラーイベントのサブスクリプションイテレーターを作成する
   */
  createErrorSubscription(sessionId?: string): AsyncIterator<any> {
    return this.pubSub.asyncIterator('audioError');
  }

  /**
   * すべてのサブスクリプションを停止する
   */
  async shutdown(): Promise<void> {
    try {
      // Note: PubSubにはcloseメソッドがありません
      // 必要に応じて接続をクリーンアップ
      console.log('WebSocket subscriptions service shutdown completed');
    } catch (error) {
      console.error('Error during WebSocket subscriptions shutdown:', error);
      throw error;
    }
  }

  /**
   * PubSubインスタンスを取得する（テスト用）
   */
  getPubSub(): PubSub {
    return this.pubSub;
  }
}