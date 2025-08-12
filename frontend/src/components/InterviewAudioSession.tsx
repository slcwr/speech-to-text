'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import Cookies from 'js-cookie';
import {
  Box,
  Typography,
  Paper,
  Alert,
  LinearProgress,
} from '@mui/material';
import AudioRecorder from './AudioRecorder';
import SpeechSynthesis from './SpeechSynthesis';
import { COMPLETE_ANSWER } from '../graphql/mutations/interview';
import { AUDIO_TRANSCRIPTION_SUBSCRIPTION } from '../graphql/subscriptions/interview';

/**
 * インタビュー音声セッションコンポーネントのプロパティ
 */
interface InterviewAudioSessionProps {
  /** セッションID */
  sessionId: string;
  /** 現在の質問 */
  currentQuestion: {
    id: string;
    question: string;
    orderNumber: number;
  };
  /** 全質問数 */
  totalQuestions: number;
  /** 次の質問に進む時のコールバック */
  onNextQuestion?: (question: any) => void;
  /** インタビュー完了時のコールバック */
  onInterviewComplete?: () => void;
  /** エラー発生時のコールバック */
  onError?: (error: Error) => void;
}

/**
 * インタビューの音声録音とリアルタイム転写を統合したコンポーネント
 * シーケンス図の203-241行を実装
 */
const InterviewAudioSession: React.FC<InterviewAudioSessionProps> = ({
  sessionId,
  currentQuestion,
  totalQuestions,
  onNextQuestion,
  onInterviewComplete,
  onError,
}) => {
  console.log('InterviewAudioSession props:', {
    sessionId,
    currentQuestion: currentQuestion ? {
      id: currentQuestion.id,
      orderNumber: currentQuestion.orderNumber,
      question: currentQuestion.question.substring(0, 50) + '...'
    } : null,
    totalQuestions
  });

  // リアルタイム転写結果
  const [transcription, setTranscription] = useState<string>('');
  // 録音状態
  const [isRecording, setIsRecording] = useState(false);
  // 音声チャンク送信中
  const [isProcessing, setIsProcessing] = useState(false);
  // エラー状態
  const [error, setError] = useState<string | null>(null);

  // 回答完了のmutation
  const [completeAnswer, { loading: completingAnswer }] = useMutation(COMPLETE_ANSWER, {
    onCompleted: (data) => {
      console.log('🎉 Mutation completed successfully:', data);
      console.log('📊 Interview progress:', data.completeAnswer.progress);
      
      if (data.completeAnswer.isInterviewComplete) {
        console.log('🏁 Interview completed! Final progress:', data.completeAnswer.progress);
        // Navigate to evaluation page
        window.location.href = `/evaluation?sessionId=${sessionId}`;
      } else if (data.completeAnswer.nextQuestion) {
        console.log('➡️ Moving to next question. Progress:', 
          `${data.completeAnswer.progress.completed}/${data.completeAnswer.progress.total}`);
        onNextQuestion?.(data.completeAnswer.nextQuestion);
        setTranscription(''); // 転写結果をリセット
      }
    },
    onError: (error) => {
      console.error('❌ Mutation failed with error:', error);
      console.error('Error details:', {
        message: error.message,
        networkError: error.networkError,
        graphQLErrors: error.graphQLErrors,
      });
      setError('回答の完了処理に失敗しました');
      onError?.(new Error(error.message));
    },
  });

  // リアルタイム転写のサブスクリプション（一時的に無効化 - WebSocket認証問題のため）
  // const { data: subscriptionData, error: subscriptionError } = useSubscription(
  //   AUDIO_TRANSCRIPTION_SUBSCRIPTION,
  //   {
  //     variables: { sessionId },
  //     onError: (error) => {
  //       console.error('Transcription subscription error:', error);
  //       setError('転写結果の受信でエラーが発生しました');
  //     },
  //   }
  // );
  const subscriptionData = null;
  const subscriptionError = null;

  /**
   * 音声チャンクをサーバーに送信してリアルタイム転写
   */
  const handleAudioChunk = useCallback(async (chunk: Blob) => {
    if (!isRecording) return;

    try {
      setIsProcessing(true);

      // チャンクをArrayBufferに変換
      const arrayBuffer = await chunk.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // サーバーにPOST送信
      const response = await fetch('/api/audio/stream', {
        method: 'POST',
        headers: {
          'Content-Type': chunk.type || 'audio/webm',
          'Authorization': `Bearer ${Cookies.get('token')}`,
          'sessionId': sessionId,
          'questionId': currentQuestion.id,
        },
        body: buffer,
      });

      if (!response.ok) {
        throw new Error(`Audio streaming failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Audio chunk processed:', result);

    } catch (error) {
      console.error('Failed to process audio chunk:', error);
      setError('音声データの送信に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  }, [isRecording, sessionId, currentQuestion.id]);

  /**
   * 録音開始処理
   */
  const handleRecordingStart = useCallback(() => {
    setIsRecording(true);
    setTranscription('');
    setError(null);
    console.log('Recording started for question:', currentQuestion.id);
  }, [currentQuestion.id]);

  /**
   * 録音停止と回答完了処理
   */
  const handleRecordingStop = useCallback(async (audioBlob: Blob) => {
    setIsRecording(false);
    console.log('Recording stopped, completing answer...');
    console.log('Debug: sessionId =', sessionId);
    console.log('Debug: currentQuestion =', currentQuestion);
    console.log('Debug: currentQuestion.id =', currentQuestion?.id);

    if (!sessionId || !currentQuestion?.id) {
      console.error('Missing sessionId or currentQuestion.id:', { sessionId, currentQuestion });
      setError('セッション情報が不正です。ページをリロードしてください。');
      return;
    }

    try {
      const inputData = {
        sessionId: sessionId,
        questionId: currentQuestion.id,
      };
      
      console.log('🚀 Preparing to send mutation');
      console.log('🚀 sessionId:', sessionId, '(type:', typeof sessionId, ')');
      console.log('🚀 questionId:', currentQuestion.id, '(type:', typeof currentQuestion.id, ')');
      console.log('🚀 inputData:', JSON.stringify(inputData, null, 2));
      
      // 回答完了をサーバーに通知
      const result = await completeAnswer({
        variables: {
          input: inputData,
        },
      });
      
      console.log('✅ Mutation result:', result);
    } catch (error) {
      console.error('Failed to complete answer:', error);
      setError('回答の完了処理に失敗しました');
    }
  }, [completeAnswer, sessionId, currentQuestion]);

  /**
   * リアルタイム転写結果の更新
   * 注：現在WebSocket認証問題のためサブスクリプションは無効化中
   */
  useEffect(() => {
    // サブスクリプションが有効化されたら以下のコードを使用
    // if (subscriptionData?.audioTranscription) {
    //   const newTranscription = subscriptionData.audioTranscription.transcription;
    //   setTranscription(prev => {
    //     // 重複除去と自然な文章の結合
    //     const combined = prev + ' ' + newTranscription;
    //     return combined.trim();
    //   });
    // }
  }, [subscriptionData]);

  /**
   * サブスクリプションエラーの処理
   */
  useEffect(() => {
    if (subscriptionError) {
      console.error('Subscription error:', subscriptionError);
      setError('リアルタイム転写の接続でエラーが発生しました');
    }
  }, [subscriptionError]);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {/* 進行状況表示 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          質問 {currentQuestion.orderNumber} / {totalQuestions}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={(currentQuestion.orderNumber / totalQuestions) * 100}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* エラー表示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 質問表示と音声読み上げ */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          質問
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {currentQuestion.question}
        </Typography>
        
        <SpeechSynthesis 
          text={currentQuestion.question}
          autoPlay={true}
          onSpeechStart={() => console.log('Question speech started')}
          onSpeechEnd={() => console.log('Question speech ended')}
        />
      </Paper>

      {/* 音声録音コンポーネント */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <AudioRecorder
          onRecordingStart={handleRecordingStart}
          onRecordingStop={handleRecordingStop}
          onAudioChunk={handleAudioChunk}
          onError={(error) => {
            setError(error.message);
            onError?.(error);
          }}
          maxDuration={300} // 5分
          chunkInterval={1000} // 1秒ごと
          disabled={completingAnswer}
        />
        
        {/* 処理中インディケーター */}
        {isProcessing && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              音声を処理中...
            </Typography>
          </Box>
        )}
      </Paper>

      {/* リアルタイム転写結果表示 */}
      {transcription && (
        <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" color="primary" gutterBottom>
            あなたの回答（リアルタイム転写）
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              lineHeight: 1.6,
              minHeight: 40,
              whiteSpace: 'pre-wrap',
            }}
          >
            {transcription || '音声を録音すると、ここにリアルタイムで転写結果が表示されます...'}
          </Typography>
          
          {isRecording && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: 'success.main',
                  animation: 'blink 1s infinite'
                }} 
              />
              <Typography variant="caption" color="success.main">
                転写中...
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* 完了処理中の表示 */}
      {completingAnswer && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            回答を処理中です...
          </Typography>
        </Box>
      )}

      {/* CSS アニメーション */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </Box>
  );
};

export default InterviewAudioSession;