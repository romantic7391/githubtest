import type { NextAuthConfig } from 'next-auth';
import type { AdapterUser } from 'next-auth/adapters';
import NextAuth, { CredentialsSignin } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { EmptyCredentialsError, UnknownError } from './lib/credential.error';
import { User } from './types/next-auth';

async function authenticate(signInId: string, password: string) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://nextjs.localhost';
  const requestUrl = new URL('/api/signin', baseUrl);

  try {
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        signInId,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { success, message, data } = await response.json();

    if (!success) {
      const error = new CredentialsSignin();
      error.code = message;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Authentication error:', error);
    const authError = new CredentialsSignin();
    authError.code = '인증 서버에 연결할 수 없습니다.';
    throw authError;
  }
}

export const config: NextAuthConfig = {
  debug: process.env.NODE_ENV === 'development',
  logger: {
    debug: (message, metadata) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[auth][debug] ${message} ${metadata}`);
      }
    },
    warn: (code) => {
      console.warn(`[auth][warn] ${code}`);
    },
    error: (error) => {
      console.error(`[auth][error] ${error}`, error);
    },
  },
  trustHost: process.env.AUTH_TRUST === 'true' || process.env.NODE_ENV === 'development',
  secret: process.env.AUTH_SECRET || 'fallback-secret-key-for-development',
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    // 세션 만료 시간 (단위: 초)
    maxAge: 60 * 60 * 24,
    // 세션 갱신 시간 (단위: 초).
    updateAge: 60 * 60 * 24,
  },
  providers: [
    CredentialsProvider({
      credentials: {
        signInId: { defaultValue: '' },
        password: { defaultValue: '' },
      },

      authorize: async (credentials) => {
        if (!credentials?.signInId || !credentials?.password) {
          throw new EmptyCredentialsError();
        }

        if (typeof credentials.signInId !== 'string' || typeof credentials.password !== 'string') {
          throw new UnknownError();
        }

        // 여기서 Service 통해서 곧바로 DB 호출 시 에러 발생하여 API 호출로 대체.
        // Error [TypeError]: Cannot read properties of undefined (reading 'replace')
        const user = await authenticate(credentials.signInId, credentials.password);
        return user as User | null;
      },
    }),
  ],
  // https://authjs.dev/reference/nextjs#callbacks
  callbacks: {
    signIn: async ({}) => {
      return true;
    },
    // token.sub: 사용자 고유 식별자
    // token.iat: 토큰 발행 시간
    // token.exp: 토큰 만료 시간
    // token.jti: 토큰 고유 식별자
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = { ...user };
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token.user) {
        session.user = {
          ...token.user,
          // AdapterUser 타입을 위한 속성. 사용하지 않습니다.
          id: token.user.id || '',
          email: '',
          emailVerified: null,
        } satisfies AdapterUser;
      }
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth(config);
