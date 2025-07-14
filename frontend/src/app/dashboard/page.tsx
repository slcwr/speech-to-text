'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box, Button, Paper, Alert, CircularProgress, LinearProgress } from '@mui/material';
import { useQuery, useLazyQuery } from '@apollo/client';
import Cookies from 'js-cookie';
import { GET_CURRENT_USER } from '/workspaces/speech-to-text/frontend/src/graphql/queries/auth';
import { GET_LATEST_SESSION } from '/workspaces/speech-to-text/frontend/src/graphql/queries/interview';
import type { User, GetCurrentUserQueryData } from './types';

export default function DashboardPage() {
  const router = useRouter();
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data, loading, error } = useQuery<GetCurrentUserQueryData>(GET_CURRENT_USER);
  const [getLatestSession, { data: sessionData, loading: sessionLoading }] = useLazyQuery(GET_LATEST_SESSION);

  console.log('get_current_user', error);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
    } else {
      // Check for existing session
      getLatestSession();
    }
  }, [router, getLatestSession]);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    router.push('/');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('idle');
      setUploadMessage('');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setUploadMessage('ファイルをアップロード中...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadStatus('success');
      setUploadMessage('スキルシートが正常にアップロードされました。分析中...');
      
      // Refresh session data and poll for completion
      const pollForCompletion = async () => {
        let attempts = 0;
        const maxAttempts = 30; // 30秒間チェック
        
        const checkStatus = async () => {
          try {
            const { data: sessionResult } = await getLatestSession();
            if (sessionResult?.getLatestSession?.skillSheet?.analysisStatus === 'completed') {
              setUploadMessage('分析が完了しました！面接を開始できます。');
              return true;
            }
            return false;
          } catch (error) {
            console.error('Status check error:', error);
            return false;
          }
        };
        
        const poll = async () => {
          attempts++;
          const isComplete = await checkStatus();
          
          if (isComplete) {
            return;
          }
          
          if (attempts < maxAttempts) {
            setTimeout(poll, 1000); // 1秒後に再チェック
          } else {
            setUploadMessage('分析に時間がかかっています。しばらくお待ちください。');
          }
        };
        
        // 最初のチェック
        setTimeout(poll, 1000);
      };
      
      pollForCompletion();

    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('アップロードに失敗しました。もう一度お試しください。');
      console.error('Upload error:', error);
    }
  };

  const handleStartInterview = () => {
    router.push('/interview');
  };

  if (loading) return <div>Loading...</div>;
  if (error) {
    console.error('Error:', error);
    return <div>Error loading user data</div>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
          <Button variant="outlined" onClick={handleLogout}>
            ログアウト
          </Button>
        </Box>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            ようこそ, {data?.me?.name || data?.me?.email}さん!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Email: {data?.me?.email}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Role: {data?.me?.role}
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            面接練習システムへようこそ
          </Typography>
          <Typography variant="body1" paragraph>
            スキルシートをアップロードして、パーソナライズされた技術面接の練習を始めましょう。
          </Typography>
          
          <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom color="info.contrastText">
              📄 推奨ファイル形式
            </Typography>
            <Typography variant="body2" color="info.contrastText" sx={{ mb: 1 }}>
              • <strong>PDF</strong>: 最も確実に解析できます（最推奨）
            </Typography>
            <Typography variant="body2" color="info.contrastText" sx={{ mb: 1 }}>
              • <strong>Word文書</strong>: .docx, .doc形式
            </Typography>
            <Typography variant="body2" color="info.contrastText" sx={{ mb: 1 }}>
              • <strong>Excel</strong>: .xlsx, .xls形式（自動でCSV変換されます）
            </Typography>
            <Typography variant="caption" color="info.contrastText">
              ファイルサイズ: 20MB以下
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button 
              variant="outlined" 
              component="label"
              disabled={uploadStatus === 'uploading'}
              sx={{ mr: 2 }}
            >
              ファイルを選択
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx,.xlsx,.xls"
                onChange={handleFileSelect}
              />
            </Button>
            
            {selectedFile && (
              <Button 
                variant="contained" 
                onClick={handleFileUpload}
                disabled={uploadStatus === 'uploading'}
                sx={{ ml: 1 }}
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    アップロード中...
                  </>
                ) : (
                  'アップロード'
                )}
              </Button>
            )}
          </Box>

          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              選択されたファイル: {selectedFile.name}
            </Typography>
          )}

          {uploadMessage && (
            <Alert 
              severity={uploadStatus === 'error' ? 'error' : uploadStatus === 'success' ? 'success' : 'info'}
              sx={{ mt: 2 }}
            >
              {uploadMessage}
            </Alert>
          )}

          {uploadStatus === 'uploading' && (
            <LinearProgress sx={{ mt: 2 }} />
          )}

          {sessionData?.getLatestSession?.skillSheet?.analysisStatus === 'completed' && (
            <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: 'success.light' }}>
              <Typography variant="h6" gutterBottom color="success.contrastText">
                ✅ 準備完了
              </Typography>
              <Typography variant="body2" color="success.contrastText" sx={{ mb: 2 }}>
                スキルシートの分析が完了しました。面接を開始できます。
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleStartInterview}
                size="large"
              >
                面接を開始する
              </Button>
            </Paper>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
