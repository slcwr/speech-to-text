'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

/**
 * 音声録音コンポーネントのプロパティ
 */
interface AudioRecorderProps {
  /** 録音開始時のコールバック */
  onRecordingStart?: () => void;
  /** 録音停止時のコールバック */
  onRecordingStop?: (blob: Blob) => void;
  /** 音声チャンク受信時のコールバック（リアルタイム転写用） */
  onAudioChunk?: (chunk: Blob) => void;
  /** エラー発生時のコールバック */
  onError?: (error: Error) => void;
  /** 録音の最大時間（秒） */
  maxDuration?: number;
  /** 音声チャンクの送信間隔（ミリ秒） */
  chunkInterval?: number;
  /** 録音を無効にするかどうか */
  disabled?: boolean;
}

/**
 * 音声録音の状態
 */
type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

/**
 * Web Media API を使用した音声録音コンポーネント
 * リアルタイム音声転写のためのチャンク送信機能付き
 */
const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingStart,
  onRecordingStop,
  onAudioChunk,
  onError,
  maxDuration = 300, // 5分
  chunkInterval = 1000, // 1秒
  disabled = false,
}) => {
  // 録音状態
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  // 録音時間（秒）
  const [duration, setDuration] = useState(0);
  // MediaRecorder API のサポート状況
  const [isSupported, setIsSupported] = useState(false);
  // 初期化中かどうか
  const [isInitializing, setIsInitializing] = useState(false);

  // MediaRecorder インスタンス
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // MediaStream インスタンス
  const mediaStreamRef = useRef<MediaStream | null>(null);
  // 録音データのチャンク
  const audioChunksRef = useRef<Blob[]>([]);
  // 録音時間の更新用タイマー
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  // チャンク送信用タイマー
  const chunkTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * MediaRecorder API のサポート状況をチェック
   */
  useEffect(() => {
    const checkSupport = () => {
      if (
        typeof window !== 'undefined' &&
        'mediaDevices' in navigator &&
        'getUserMedia' in navigator.mediaDevices &&
        'MediaRecorder' in window
      ) {
        setIsSupported(true);
      } else {
        setIsSupported(false);
      }
    };

    checkSupport();
  }, []);

  /**
   * 録音時間の更新処理
   */
  const updateDuration = useCallback(() => {
    setDuration((prev) => {
      const newDuration = prev + 1;
      // 最大録音時間に達した場合、自動停止
      if (newDuration >= maxDuration) {
        stopRecording();
      }
      return newDuration;
    });
  }, [maxDuration]);

  /**
   * 録音を開始する
   */
  const startRecording = useCallback(async () => {
    if (!isSupported || recordingState !== 'idle' || disabled) return;

    try {
      setIsInitializing(true);

      // マイクへのアクセスを要求
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Gemini API 推奨設定
        },
      });

      mediaStreamRef.current = stream;

      // MediaRecorder を作成
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // イベントハンドラーを設定
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          // リアルタイム転写用にチャンクを送信
          onAudioChunk?.(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // 全チャンクを結合
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        onRecordingStop?.(audioBlob);

        // リソースをクリーンアップ
        cleanupMediaResources();
      };

      mediaRecorder.onerror = (event) => {
        const error = new Error(`MediaRecorder error: ${(event as any).error}`);
        onError?.(error);
        cleanupMediaResources();
      };

      // 録音開始
      mediaRecorder.start(chunkInterval); // 指定間隔でチャンクを生成
      setRecordingState('recording');
      setDuration(0);
      onRecordingStart?.();

      // 録音時間の更新を開始
      durationTimerRef.current = setInterval(updateDuration, 1000);

      setIsInitializing(false);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsInitializing(false);
      onError?.(error as Error);
    }
  }, [
    isSupported,
    recordingState,
    disabled,
    onRecordingStart,
    onAudioChunk,
    chunkInterval,
    updateDuration,
    onError,
  ]);

  /**
   * 録音を停止する
   */
  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      recordingState !== 'idle' &&
      recordingState !== 'stopped'
    ) {
      mediaRecorderRef.current.stop();
      setRecordingState('stopped');

      // タイマーをクリア
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }
  }, [recordingState]);

  /**
   * 録音を一時停止/再開する
   */
  const togglePauseRecording = useCallback(() => {
    if (!mediaRecorderRef.current) return;

    if (recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      // タイマーを一時停止
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    } else if (recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      // タイマーを再開
      durationTimerRef.current = setInterval(updateDuration, 1000);
    }
  }, [recordingState, updateDuration]);

  /**
   * メディアリソースをクリーンアップ
   */
  const cleanupMediaResources = useCallback(() => {
    // MediaStream を停止
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // タイマーをクリア
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    if (chunkTimerRef.current) {
      clearInterval(chunkTimerRef.current);
      chunkTimerRef.current = null;
    }

    mediaRecorderRef.current = null;
    setRecordingState('idle');
    setDuration(0);
  }, []);

  /**
   * コンポーネントのクリーンアップ
   */
  useEffect(() => {
    return () => {
      cleanupMediaResources();
    };
  }, [cleanupMediaResources]);

  /**
   * 録音時間をフォーマット（MM:SS）
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // MediaRecorder API 非対応の場合
  if (!isSupported) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        このブラウザは音声録音に対応していません。Chrome、Firefox、Safari
        の最新版をご使用ください。
      </Alert>
    );
  }

  return (
    <Box
      sx={{ p: 2, border: 1, borderColor: 'grey.300', borderRadius: 2, my: 2 }}
    >
      {/* 録音状態とタイマー表示 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography variant="h6" color="primary">
          音声回答録音
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {recordingState !== 'idle' && (
            <>
              <Typography variant="body2" color="text.secondary">
                {formatDuration(duration)} / {formatDuration(maxDuration)}
              </Typography>
              {recordingState === 'recording' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'error.main',
                      animation: 'blink 1s infinite',
                    }}
                  />
                  <Typography variant="caption" color="error">
                    録音中
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* 進行状況バー */}
      {recordingState !== 'idle' && (
        <LinearProgress
          variant="determinate"
          value={(duration / maxDuration) * 100}
          sx={{ mb: 2, height: 6, borderRadius: 3 }}
          color={recordingState === 'recording' ? 'primary' : 'secondary'}
        />
      )}

      {/* コントロールボタン */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          justifyContent: 'center',
        }}
      >
        {recordingState === 'idle' ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={
              isInitializing ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <MicIcon />
              )
            }
            onClick={startRecording}
            disabled={disabled || isInitializing}
            sx={{ minWidth: 140 }}
          >
            {isInitializing ? '初期化中...' : '録音開始'}
          </Button>
        ) : (
          <>
            {/* 一時停止/再開ボタン */}
            <IconButton
              color={recordingState === 'recording' ? 'warning' : 'primary'}
              size="large"
              onClick={togglePauseRecording}
              disabled={recordingState === 'stopped'}
            >
              {recordingState === 'recording' ? (
                <PauseIcon />
              ) : (
                <PlayArrowIcon />
              )}
            </IconButton>

            {/* 停止ボタン */}
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<StopIcon />}
              onClick={stopRecording}
              disabled={recordingState === 'stopped'}
              sx={{ minWidth: 120 }}
            >
              録音停止
            </Button>
          </>
        )}
      </Box>

      {/* 状態メッセージ */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {recordingState === 'idle' &&
            '「録音開始」ボタンを押して回答を開始してください'}
          {recordingState === 'recording' &&
            '話してください。回答が完了したら「録音停止」を押してください'}
          {recordingState === 'paused' &&
            '録音を一時停止中です。再開するには再生ボタンを押してください'}
          {recordingState === 'stopped' &&
            '録音を停止しました。データを処理中です...'}
        </Typography>
      </Box>

      {/* CSS アニメーション */}
      <style jsx>{`
        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </Box>
  );
};

export default AudioRecorder;
