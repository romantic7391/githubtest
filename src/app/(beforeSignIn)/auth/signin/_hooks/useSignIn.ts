import {
  AccountLockedError,
  AccountNotApprovedError,
  EmptyCredentialsError,
  InvalidCredentialsError,
  TooManyLoginAttemptsError,
  UnknownError,
  UserNotFoundError,
} from '@/lib/credential.error';
import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';

function throwErrorByCode(code: string) {
  let error = new Error();

  switch (code) {
    case 'INVALID_CREDENTIALS':
      error = new InvalidCredentialsError();
      break;
    case 'EMPTY_CREDENTIALS':
      error = new EmptyCredentialsError();
      break;
    case 'TOO_MANY_LOGIN_ATTEMPTS':
      error = new TooManyLoginAttemptsError();
      break;
    case 'USER_NOT_FOUND':
      error = new UserNotFoundError();
      break;
    case 'ACCOUNT_LOCKED':
      error = new AccountLockedError();
      break;
    case 'ACCOUNT_NOT_APPROVED':
      error = new AccountNotApprovedError();
      break;
    case 'UNKNOWN_ERROR':
    default:
      error = new UnknownError();
      break;
  }

  const message = error.message.slice(0, error.message.indexOf('.'));
  throw new Error(message);
}

export default function useSignin() {
  async function mutationFn({ signInId, password }: { signInId: string; password: string }) {
    const { code, error, url } = await signIn('credentials', {
      signInId,
      password,
      redirect: false,
    });

    if (code !== undefined && error !== undefined) {
      throwErrorByCode(code);
    }

    return url;
  }

  return useMutation({
    mutationFn,
    throwOnError: false,
  });
}
