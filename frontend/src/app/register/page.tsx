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
import { REGISTER_MUTATION } from '/workspaces/speech-to-text/frontend/src/graphql/mutations/auth';
import type { RegisterMutation, RegisterMutationVariables, RegisterInput } from './types';
import { useApolloClient } from '@apollo/client';  

interface RegisterFormData extends RegisterInput {
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const client = useApolloClient(); 
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const [registerUser] = useMutation<RegisterMutation, RegisterMutationVariables>(REGISTER_MUTATION, {
    onCompleted: async (data) => {
      try {
        // キャッシュをクリアして古いデータを除去
        await client.clearStore();
        
        // Extract user data from fragment
        const userData = data.register.user; 
        
        // Store token in cookie with 7 days expiration
        Cookies.set('token', data.register.token, { 
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
        console.error('Error during registration completion:', error);
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

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    const { confirmPassword, ...registerData } = data;
    await registerUser({
      variables: {
        input: registerData,
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
            新規登録
          </Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              margin="normal"
              fullWidth
              id="name"
              label="Name (Optional)"
              autoComplete="name"
              autoFocus
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              autoComplete="email"
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
              autoComplete="new-password"
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
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
            <Box textAlign="center">
              <MuiLink component={Link} href="/login" variant="body2">
                すでにアカウントをお持ちですか? ログインへ
              </MuiLink>
            </Box>
          </Box>
        </Paper> 
      </Box>
    </Container>
  );
}