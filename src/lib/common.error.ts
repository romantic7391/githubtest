/**
 * HTTP 상태에 따른 에러
 *
 * @param message 에러 메시지
 * @param status HTTP 상태 코드
 */
export class HTTPStatusError extends Error {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'HTTPStatusError';
    this.status = status;
  }
}
