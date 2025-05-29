/**
 * Auth.js 타입 재정의
 *
 * @see https://authjs.dev/getting-started/typescript#module-augmentation
 */

import 'next-auth';
import { DefaultSession } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  // Auth.js 사용자 타입
  interface User {
    manager_no: number;
  }

  interface Session extends DefaultSession {
    user: {} & DefaultSession['user'];
  }
}

declare module 'next-auth/adapters' {
  // AdapterUser 타입 재정의해도 id, email, emailVerified 속성을 재정의할 수 없음.
  interface AdapterUser {
    id?: string;
    email?: string;
    emailVerified?: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    user: {} & DefaultSession['user'];
  }
}
