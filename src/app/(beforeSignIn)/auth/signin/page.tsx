'use client';

import { signIn } from 'next-auth/react';

export default function Page() {
  return (
    <>
      <button
        onClick={() =>
          signIn('credentials', {
            id: 'id',
            password: 'password',
          })
        }>
        로그인
      </button>
    </>
  );
}
