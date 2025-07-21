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

interface SpeechSynthesisProps {
  text: string;
  autoPlay?: boolean;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onSpeechError?: (error: Error) => void;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

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
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check Web Speech API support
  useEffect(() => {
    const checkSupport = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        setIsSupported(true);
        
        const loadVoices = () => {
          const availableVoices = window.speechSynthesis.getVoices();
          setVoices(availableVoices);
          setIsLoading(false);
        };

        // Load voices
        loadVoices();
        
        // Some browsers load voices asynchronously
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        // Fallback timeout
        setTimeout(() => {
          if (voices.length === 0) {
            loadVoices();
          }
        }, 1000);
      } else {
        setIsSupported(false);
        setIsLoading(false);
      }
    };

    checkSupport();

    // Cleanup
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [voices.length]);

  const speak = useCallback(() => {
    if (!isSupported || !text || isSpeaking) return;

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      // Find the best voice for the language
      const preferredVoice = voices.find(voice => 
        voice.lang === lang || voice.lang.startsWith(lang.split('-')[0])
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Event handlers
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

      // Start speech
      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error('Speech synthesis failed:', error);
      setIsSpeaking(false);
      onSpeechError?.(error as Error);
    }
  }, [isSupported, text, isSpeaking, lang, rate, pitch, volume, voices, onSpeechStart, onSpeechEnd, onSpeechError]);

  const stop = useCallback(() => {
    if (isSupported && (isSpeaking || isPaused)) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported, isSpeaking, isPaused]);

  const replay = useCallback(() => {
    stop();
    // Small delay to ensure the previous speech is fully stopped
    setTimeout(() => {
      speak();
    }, 100);
  }, [stop, speak]);

  // Auto-play on mount
  useEffect(() => {
    if (autoPlay && !isLoading && isSupported && text && !isSpeaking) {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        speak();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [autoPlay, isLoading, isSupported, text, isSpeaking, speak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

  if (!isSupported) {
    return (
      <Alert severity="warning" sx={{ my: 2 }}>
        このブラウザは音声読み上げに対応していません。質問テキストをお読みください。
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, my: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <VolumeUpIcon 
          color={isSpeaking ? 'primary' : 'action'} 
          sx={{ fontSize: 20 }}
        />
        
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {isSpeaking ? (
            isPaused ? '音声を一時停止中...' : '質問を読み上げています...'
          ) : (
            '質問の読み上げが完了しました'
          )}
        </Typography>

        <IconButton
          onClick={replay}
          size="small"
          disabled={isSpeaking}
          title="もう一度聞く"
        >
          <ReplayIcon fontSize="small" />
        </IconButton>

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
      
      {voices.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          使用中の音声: {voices.find(v => v.lang === lang)?.name || 'デフォルト'}
        </Typography>
      )}
    </Box>
  );
};

export default SpeechSynthesis;