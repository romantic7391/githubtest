/**
 * Auth.js 타입 재정의
 *
 * @see https://authjs.dev/getting-started/typescript#module-augmentation
 */

import 'next-auth';
import { DefaultSession } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';
import { z } from 'zod';

// Zod 스키마 정의
export const userSchema = z.object({
  managerNo: z.number(),
  schoolNo: z.number(),
  login_id: z.string(),
  name: z.string(),
  schoolType: z.string(),
  permissions: z.array(z.number()).optional(), // 권한 번호 목록
});

// Zod 스키마로부터 타입 추론
export type User = z.infer<typeof userSchema>;

declare module 'next-auth' {
  // Auth.js 사용자 타입
  interface User {
    managerNo: number;
    schoolNo: number;
    login_id: string;
    name: string;
    schoolType: string;
    permissions?: number[]; // 권한 번호 목록
  }

  interface Session extends DefaultSession {
    user: {
      managerNo: number;
      schoolNo: number;
      login_id: string;
      name: string;
      schoolType: string;
      permissions?: number[]; // 권한 번호 목록
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    user: User;
  }
}
