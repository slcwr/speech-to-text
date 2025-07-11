'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { useQuery } from '@apollo/client';
import Cookies from 'js-cookie';
import { GET_CURRENT_USER } from '/workspaces/speech-to-text/frontend/src/graphql/queries/auth';
import type { User, GetCurrentUserQueryData } from './types';

export default function DashboardPage() {
  const router = useRouter();
  const { data, loading, error } =
    useQuery<GetCurrentUserQueryData>(GET_CURRENT_USER);
  console.log('get_current_user', error);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    router.push('/');
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
            Logout
          </Button>
        </Box>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Welcome, {data?.me?.name || data?.me?.email}!
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
          <Button variant="contained" sx={{ mt: 2 }}>
            アップロードはこちら
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
