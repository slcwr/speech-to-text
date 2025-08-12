'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ReplayIcon from '@mui/icons-material/Replay';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

/**
 * Web Speech API を使用した音声合成コンポーネントのプロパティ
 */
interface SpeechSynthesisProps {
  /** 読み上げるテキスト */
  text: string;
  /** マウント時に自動再生するかどうか */
  autoPlay?: boolean;
  /** 音声読み上げ開始時のコールバック */
  onSpeechStart?: () => void;
  /** 音声読み上げ終了時のコールバック */
  onSpeechEnd?: () => void;
  /** エラー発生時のコールバック */
  onSpeechError?: (error: Error) => void;
  /** 言語設定（デフォルト: 'ja-JP'） */
  lang?: string;
  /** 読み上げ速度（0.1〜10、デフォルト: 0.9） */
  rate?: number;
  /** 音程（0〜2、デフォルト: 1.0） */
  pitch?: number;
  /** 音量（0〜1、デフォルト: 1.0） */
  volume?: number;
}

/**
 * Web Speech API を使用した音声合成コンポーネント
 * テキストを日本語で読み上げる機能を提供します
 */
const SpeechSynthesis: React.FC<SpeechSynthesisProps> = ({
  text,
  autoPlay = true,
  onSpeechStart,
  onSpeechEnd,
  onSpeechError,
  lang = 'ja-JP',
  rate = 0.9,
  pitch = 1.0,
  volume = 1.0,
}) => {
  // Web Speech API のサポート状況
  const [isSupported, setIsSupported] = useState(false);
  // 現在読み上げ中かどうか
  const [isSpeaking, setIsSpeaking] = useState(false);
  // 一時停止中かどうか
  const [isPaused, setIsPaused] = useState(false);
  // 利用可能な音声リスト
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  // 音声機能の初期化中かどうか
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Web Speech API のサポート状況をチェックし、利用可能な音声を取得する
   */
  useEffect(() => {
    let fallbackTimer: NodeJS.Timeout | null = null;
    
    const checkSupport = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        setIsSupported(true);
        
        const loadVoices = () => {
          const availableVoices = window.speechSynthesis.getVoices();
          setVoices(availableVoices);
          setIsLoading(false);
        };

        // 音声リストを読み込み
        loadVoices();
        
        // ブラウザによっては音声が非同期で読み込まれるため、イベントリスナーを設定
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        // フォールバックタイマー（音声読み込み完了を保証）
        fallbackTimer = setTimeout(() => {
          const currentVoices = window.speechSynthesis.getVoices();
          if (currentVoices.length > 0) {
            setVoices(currentVoices);
            setIsLoading(false);
          }
        }, 1000);
      } else {
        setIsSupported(false);
        setIsLoading(false);
      }
    };

    checkSupport();

    // クリーンアップ処理
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
    };
  }, []);

  /**
   * テキストを音声で読み上げる
   */
  const speak = useCallback(() => {
    if (!isSupported || !text || isSpeaking) return;

    try {
      // 実行中の音声があればキャンセル
      window.speechSynthesis.cancel();

      // 音声合成オブジェクトを作成
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      // 指定言語に最適な音声を選択
      const preferredVoice = voices.find(voice => 
        voice.lang === lang || voice.lang.startsWith(lang.split('-')[0])
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // 音声読み上げイベントハンドラーを設定
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        onSpeechStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        onSpeechEnd?.();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        setIsPaused(false);
        const error = new Error(`Speech synthesis error: ${event.error}`);
        onSpeechError?.(error);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      // 音声読み上げを開始
      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error('Speech synthesis failed:', error);
      setIsSpeaking(false);
      onSpeechError?.(error as Error);
    }
  }, [isSupported, text, isSpeaking, lang, rate, pitch, volume, voices, onSpeechStart, onSpeechEnd, onSpeechError]);

  /**
   * 音声読み上げを停止する
   */
  const stop = useCallback(() => {
    if (isSupported && (isSpeaking || isPaused)) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported, isSpeaking, isPaused]);

  /**
   * 音声読み上げを再生する（停止してから再開）
   */
  const replay = useCallback(() => {
    stop();
    // 前の音声が確実に停止されるまで少し待つ
    setTimeout(() => {
      speak();
    }, 100);
  }, [stop, speak]);

  /**
   * 自動再生機能：テキストが変更された時に自動で読み上げを開始
   */
  useEffect(() => {
    if (autoPlay && !isLoading && isSupported && text.trim()) {
      // 既に実行中の音声があればキャンセル
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      
      // コンポーネントのマウント完了と前の音声のキャンセルを確実にするため少し遅延
      const timer = setTimeout(() => {
        if (!isSpeaking) { // 読み上げ状態を再確認してから実行
          speak();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [text]); // テキストの変更のみを監視

  /**
   * アンマウント時のクリーンアップ処理
   */
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // 音声機能初期化中の表示
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
        <CircularProgress size={16} />
        <Typography variant="body2" color="text.secondary">
          音声機能を初期化中...
        </Typography>
      </Box>
    );
  }

  // Web Speech API 非対応ブラウザ用の表示
  if (!isSupported) {
    return (
      <Alert severity="warning" sx={{ my: 2 }}>
        このブラウザは音声読み上げに対応していません。質問テキストをお読みください。
      </Alert>
    );
  }

  // メインUI（音声コントロール）の表示
  return (
    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, my: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* 音声状態インディケーター */}
        <VolumeUpIcon 
          color={isSpeaking ? 'primary' : 'action'} 
          sx={{ fontSize: 20 }}
        />
        
        {/* 状態表示テキスト */}
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {isSpeaking ? (
            isPaused ? '音声を一時停止中...' : '質問を読み上げています...'
          ) : (
            '質問の読み上げが完了しました'
          )}
        </Typography>

        {/* 再生ボタン */}
        <IconButton
          onClick={replay}
          size="small"
          disabled={isSpeaking}
          title="もう一度聞く"
        >
          <ReplayIcon fontSize="small" />
        </IconButton>

        {/* 停止ボタン（読み上げ中のみ表示） */}
        {isSpeaking && (
          <IconButton
            onClick={stop}
            size="small"
            title="停止"
          >
            <VolumeOffIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      
      {/* 使用中音声の情報表示 */}
      {voices.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          使用中の音声: {voices.find(v => v.lang === lang)?.name || 'デフォルト'}
        </Typography>
      )}
    </Box>
  );
};

export default SpeechSynthesis;