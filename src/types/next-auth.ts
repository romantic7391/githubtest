/**
 * Auth.js 타입 재정의
 *
 * @see https://authjs.dev/getting-started/typescript#module-augmentation
 */

import 'next-auth';
import { DefaultSession } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';
import { z } from 'zod';

export const userSchema = z.object({
  managerNo: z.number(),
  schoolNo: z.number(),
  signInId: z.string(),
  name: z.string(),
});
export type User = z.infer<typeof userSchema>;

export const userWithPasswordSchema = userSchema.extend({
  /**
   * 해시된 비밀번호
   */
  hashedPassword: z.string(),
});
export type UserWithPassword = z.infer<typeof userWithPasswordSchema>;

export const signInUserSchema = userSchema.pick({ signInId: true }).extend({
  /**
   * 사용자 입력 비밀번호
   */
  password: z.string(),
});
export type SignInUser = z.infer<typeof signInUserSchema>;

declare module 'next-auth' {
  // Auth.js 사용자 타입
  interface User {
    managerNo: number;
    schoolNo: number;
    signInId: string;
    name: string;
  }

  interface Session extends DefaultSession {
    user: {} & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    user: {} & DefaultSession['user'];
  }
}
