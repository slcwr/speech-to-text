'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@apollo/client';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MicIcon from '@mui/icons-material/Mic';
import { START_INTERVIEW, StartInterviewResponse, InterviewQuestion } from '../../graphql/mutations/startInterview';
import SpeechSynthesis from '../../components/SpeechSynthesis';

const InterviewPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [allQuestions, setAllQuestions] = useState<InterviewQuestion[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [canRecord, setCanRecord] = useState(false);

  const [startInterview, { loading, error }] = useMutation<StartInterviewResponse>(START_INTERVIEW, {
    onCompleted: (data) => {
      setCurrentQuestion(data.startInterview.currentQuestion);
      setAllQuestions(data.startInterview.allQuestions);
      setIsInterviewStarted(true);
      setActiveStep(0);
    },
    onError: (error) => {
      console.error('Failed to start interview:', error);
    },
  });

  useEffect(() => {
    if (!sessionId) {
      router.push('/dashboard');
    }
  }, [sessionId, router]);

  const handleStartInterview = async () => {
    if (!sessionId) return;
    
    await startInterview({
      variables: {
        input: {
          sessionId,
        },
      },
    });
  };

  const getStepLabels = () => {
    if (allQuestions.length === 0) {
      return ['準備中...'];
    }
    return allQuestions.map((q, index) => `質問 ${index + 1}`);
  };

  if (!sessionId) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          面接セッション
        </Typography>
        <Typography variant="body1" color="text.secondary">
          セッションID: {sessionId}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          面接の開始に失敗しました: {error.message}
        </Alert>
      )}

      {!isInterviewStarted ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h5" gutterBottom>
              面接を開始する準備ができました
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              「面接を開始」ボタンをクリックして、面接を始めてください。
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
              onClick={handleStartInterview}
              disabled={loading}
              sx={{ px: 4, py: 1.5 }}
            >
              {loading ? '開始中...' : '面接を開始'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Box sx={{ width: '100%', mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {getStepLabels().map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {currentQuestion && (
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  質問 {currentQuestion.orderNumber}
                </Typography>
                <Typography variant="h5" component="div" sx={{ mt: 2, mb: 3 }}>
                  {currentQuestion.question}
                </Typography>
                
                <SpeechSynthesis
                  text={currentQuestion.question}
                  autoPlay={true}
                  onSpeechStart={() => setCanRecord(false)}
                  onSpeechEnd={() => setCanRecord(true)}
                  onSpeechError={(error) => {
                    console.error('Speech synthesis error:', error);
                    setCanRecord(true); // エラー時も録音可能にする
                  }}
                  lang="ja-JP"
                  rate={0.9}
                />
                
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    startIcon={<MicIcon />}
                    disabled={!canRecord}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    {canRecord ? '録音を開始' : '質問読み上げ中...'}
                  </Button>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }} color="text.secondary">
                    音声録音機能は次のステップで実装されます
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Container>
  );
};

export default InterviewPage;