'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
import { START_INTERVIEW, StartInterviewResponse, InterviewQuestion, COMPLETE_ANSWER } from '../../graphql/mutations/interview';
import { InterviewProgress } from '../../graphql/types/graphql';
import SpeechSynthesis from '../../components/SpeechSynthesis';
import AudioRecorder from '../../components/AudioRecorder';
import InterviewAudioSession from '../../components/InterviewAudioSession';

const InterviewPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [allQuestions, setAllQuestions] = useState<InterviewQuestion[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [canRecord, setCanRecord] = useState(false);
  const [progress, setProgress] = useState<InterviewProgress | null>(null);

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

  const [completeAnswer, { loading: completingAnswer }] = useMutation(COMPLETE_ANSWER, {
    onCompleted: (data) => {
      console.log('🔍 CompleteAnswer response:', data);
      
      // Update progress information
      if (data.completeAnswer.progress) {
        setProgress(data.completeAnswer.progress);
        console.log('📊 Progress updated:', data.completeAnswer.progress);
      }
      
      if (data.completeAnswer.isInterviewComplete) {
        // Interview is complete
        console.log('✅ Interview completed:', data.completeAnswer.message);
        // TODO: Navigate to results page
      } else if (data.completeAnswer.nextQuestion) {
        // Move to next question
        console.log('📝 Moving to next question:', data.completeAnswer.nextQuestion);
        console.log('📝 Current question before update:', currentQuestion);
        
        setCurrentQuestion(data.completeAnswer.nextQuestion);
        setActiveStep(prev => {
          const newStep = prev + 1;
          console.log('📊 Active step updated from', prev, 'to', newStep);
          return newStep;
        });
        setCanRecord(false); // Reset recording state for new question
        
        console.log('🎯 Question transition completed');
      } else {
        console.warn('⚠️ No next question in response, but interview not complete');
      }
    },
    onError: (error) => {
      console.error('❌ Failed to complete answer:', error);
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

  const handleRecordingStop = async (blob: Blob) => {
    if (!sessionId || !currentQuestion) {
      console.error('Missing sessionId or currentQuestion');
      return;
    }

    console.log('🎤 Recording stopped, blob size:', blob.size);
    console.log('📝 Processing question:', currentQuestion.orderNumber, '-', currentQuestion.question.substring(0, 50));
    
    // TODO: Process the audio blob - upload to server for transcription if needed
    // For now, we'll just call completeAnswer to move to next question
    
    try {
      console.log('🚀 Calling completeAnswer mutation...');
      await completeAnswer({
        variables: {
          input: {
            sessionId,
            questionId: currentQuestion.id,
          },
        },
      });
      console.log('✅ CompleteAnswer mutation called successfully');
    } catch (error) {
      console.error('❌ Error completing answer:', error);
    }
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
            
            {progress && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  進捗: {progress.completed}/{progress.total} 完了 (残り {progress.remaining})
                </Typography>
              </Box>
            )}
          </Box>

          {currentQuestion && (
            <InterviewAudioSession
              sessionId={sessionId!}
              currentQuestion={currentQuestion}
              totalQuestions={allQuestions.length}
              onNextQuestion={(question) => {
                console.log('Moving to next question:', question);
                setCurrentQuestion(question);
                setActiveStep(prev => prev + 1);
                setCanRecord(false);
              }}
              onInterviewComplete={() => {
                console.log('Interview completed');
                // TODO: Navigate to results page
              }}
              onError={(error) => {
                console.error('Interview audio session error:', error);
              }}
            />
          )}
        </>
      )}
    </Container>
  );
};

const InterviewPage: React.FC = () => {
  return (
    <Suspense fallback={
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          読み込み中...
        </Typography>
      </Container>
    }>
      <InterviewPageContent />
    </Suspense>
  );
};

export default InterviewPage;