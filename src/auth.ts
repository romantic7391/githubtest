import type { NextAuthConfig } from 'next-auth';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const config: NextAuthConfig = {
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
    maxAge: 60,
    updateAge: 60,
  },
  callbacks: {
    signIn: async ({}) => {
      return true;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      credentials: {
        id: {},
        password: {},
      },

      authorize: async () => {
        return {};
      },
    }),
  ],
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);
