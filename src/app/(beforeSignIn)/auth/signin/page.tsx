'use client';

import { signIn } from 'next-auth/react';

export default function Page() {
  return (
    <>
      <button
        onClick={() =>
          signIn('credentials', {
            signInId: 'test',
            password: 'test',
          })
        }>
        로그인
      </button>
    </>
  );
}
