'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/graphql';

const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
};

export async function loginAction(input: { email: string; password: string }) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
            user { id email name role }
          }
        }
      `,
      variables: { input },
    }),
  });

  const { data, errors } = await res.json();

  if (errors?.length) {
    return { error: errors[0].message };
  }

  const cookieStore = await cookies();
  cookieStore.set('token', data.login.token, COOKIE_OPTIONS);
  cookieStore.set('user', JSON.stringify(data.login.user), COOKIE_OPTIONS);

  redirect('/dashboard');
}

export async function registerAction(input: { email: string; password: string; name?: string | null }) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            token
            user { id email name role }
          }
        }
      `,
      variables: { input },
    }),
  });

  const { data, errors } = await res.json();

  if (errors?.length) {
    return { error: errors[0].message };
  }

  const cookieStore = await cookies();
  cookieStore.set('token', data.register.token, COOKIE_OPTIONS);
  cookieStore.set('user', JSON.stringify(data.register.user), COOKIE_OPTIONS);

  redirect('/dashboard');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('user');
  redirect('/');
}
