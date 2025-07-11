'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    console.log('Token:', token);
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Webエンジニア面接システム
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mt: 3, textAlign: 'left' }}>
            技術面接を練習しましょう。
            <br />
            スキルシートをアップロードして、パーソナライズされた質問で練習を開始してください。
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/login"
            >
              ログイン
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              href="/register"
            >
              新規登録
            </Button>
          </Box>
        </Paper>
      </Box>
 
  );
}