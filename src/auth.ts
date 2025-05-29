import type { NextAuthConfig, User } from 'next-auth';
import type { AdapterUser } from 'next-auth/adapters';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const config: NextAuthConfig = {
  debug: true,
  logger: {
    debug: (message, metadata) => {
      console.log(`[auth][debug] ${message} ${metadata}`);
    },
    warn: (code) => {
      console.log(`[auth][warn] ${code}`);
    },
    error: (error) => {
      console.log(`[auth][error] ${error}`);
    },
  },
  trustHost: process.env.AUTH_TRUST === 'true',
  secret: process.env.AUTH_SECRET,
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
        signInId: {},
        password: {},
      },

      authorize: async (credentials) => {
        console.log('[auth][authorize] runtime: ', process.env.NEXT_RUNTIME);
        console.log('[auth][authorize] credentials: ', credentials);
        return {
          id: '',
          managerNo: 1,
        } satisfies User;
      },
    }),
  ],
  // https://authjs.dev/reference/nextjs#callbacks
  callbacks: {
    signIn: async ({ user }) => {
      console.log('[auth][signIn] user: ', JSON.stringify(user));
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
        console.log('[auth][session] token.user: ', token.user);
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

export const { handlers, signIn, signOut, auth } = NextAuth(config);
