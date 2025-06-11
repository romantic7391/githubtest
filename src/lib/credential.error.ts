import { CredentialsSignin } from 'next-auth';

export class CredentialsSigninWithAttempts extends CredentialsSignin {
  public attempts: number;

  constructor(attempts: number = 0, message: string = '') {
    super(message);
    this.name = 'CredentialsSigninWithAttempts';
    this.code = 'CREDENTIALS_SIGNIN_WITH_ATTEMPTS';
    this.attempts = attempts;
  }
}

export class InvalidCredentialsError extends CredentialsSigninWithAttempts {
  public attempts: number;

  constructor(attempts: number = 0, message: string = '잘못된 아이디 또는 비밀번호입니다.') {
    super(attempts, message);
    this.name = 'InvalidCredentialsError';
    this.code = 'INVALID_CREDENTIALS';
    this.attempts = attempts;
  }
}

export class EmptyCredentialsError extends CredentialsSigninWithAttempts {
  public attempts: number;

  constructor(attempts: number = 0, message: string = '아이디 또는 비밀번호를 입력해주세요.') {
    super(attempts, message);
    this.name = 'EmptyCredentialsError';
    this.code = 'EMPTY_CREDENTIALS';
    this.attempts = attempts;
  }
}

export class TooManyLoginAttemptsError extends CredentialsSigninWithAttempts {
  public attempts: number;

  constructor(attempts: number = 0, message: string = '너무 많은 로그인 시도를 했습니다.') {
    super(attempts, message);
    this.name = 'TooManyLoginAttemptsError';
    this.code = 'TOO_MANY_LOGIN_ATTEMPTS';
    this.attempts = attempts;
  }
}

export class UserNotFoundError extends CredentialsSigninWithAttempts {
  public attempts: number;

  constructor(attempts: number = 0, message: string = '존재하지 않는 사용자입니다.') {
    super(attempts, message);
    this.name = 'UserNotFoundError';
    this.code = 'USER_NOT_FOUND';
    this.attempts = attempts;
  }
}

export class AccountLockedError extends CredentialsSigninWithAttempts {
  public attempts: number;

  constructor(attempts: number = 0, message: string = '사용할 수 없는 계정입니다.') {
    super(attempts, message);
    this.name = 'AccountLockedError';
    this.code = 'ACCOUNT_LOCKED';
    this.attempts = attempts;
  }
}

export class AccountNotApprovedError extends CredentialsSigninWithAttempts {
  public attempts: number;

  constructor(attempts: number = 0, message: string = '승인되지 않은 계정입니다.') {
    super(attempts, message);
    this.name = 'AccountNotApprovedError';
    this.code = 'ACCOUNT_NOT_APPROVED';
    this.attempts = attempts;
  }
}

export class UnknownError extends CredentialsSigninWithAttempts {
  constructor(message: string = '알 수 없는 로그인 오류가 발생했습니다.') {
    super(0, message);
    this.name = 'UnknownError';
    this.code = 'UNKNOWN_ERROR';
  }
}
