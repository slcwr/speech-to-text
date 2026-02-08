'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import Cookies from 'js-cookie';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import { LOGIN_MUTATION } from '@/graphql/mutations/auth';
import type { LoginMutation, LoginMutationVariables, LoginInput } from './types';
import { useApolloClient } from '@apollo/client';  

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const client = useApolloClient(); 
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>();

  const [login] = useMutation<LoginMutation, LoginMutationVariables>(LOGIN_MUTATION, {
    onCompleted: async (data) => {
      try {
        // キャッシュをクリアして古いデータを除去
        await client.clearStore();
        
        // Extract user data 
        const userData = data.login.user
        
        // Store token in cookie with 7 days expiration
        Cookies.set('token', data.login.token, { 
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        // Store user data in cookie
        Cookies.set('user', JSON.stringify(userData), { 
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        // ページ遷移前に少し待機してキャッシュクリアを完了させる
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      } catch (error) {
        console.error('Error during login completion:', error);
        router.push('/dashboard');
      }
    },
    onError: (error) => {
      setError(error.message);
    },
    // キャッシュからの読み取りを無効化
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    await login({
      variables: {
        input: data,
      },
    });
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center">
            ログイン
          </Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </Button>
            <Box textAlign="center">
              <MuiLink component={Link} href="/register" variant="body2">
                {"アカウントをお持ちではないですか? 新規登録"}
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}