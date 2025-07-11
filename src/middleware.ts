import { NextRequest, NextResponse } from 'next/server';
import { match } from 'path-to-regexp';
import { auth, config as authConfig } from '@/auth';
import { User } from '@/types/next-auth';

/**
 * 미들웨어 설정입니다.
 */
export const config = {
  /**
   * matcher 배열에 있는 패턴 중 하나와 일치하는 URL로 요청이 들어올 경우에만 미들웨어를 실행합니다.
   */
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청 경로와 일치합니다:
     * - _next/static (정적 파일 경로)
     * - _next/image (이미지 최적화 파일 경로)
     * - favicon.ico, sitemap.xml, robots.txt (메타데이터 파일)
     * - .well-known/appspecific/com.chrome.devtools.json (Chrome DevTools 파일)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known/appspecific/com.chrome.devtools.json).*)',
  ],
};

/**
 * 로그인이 필요없는 URL
 */
const matchersForPublic: string[] = ['/logo.svg'];

/**
 * 로그인, 회원가입 페이지 및 관련 엔드포인트 URL
 */
const matchersForSignInAndSignUp: string[] = ['/auth/signin', '/auth/signup'];

/**
 * Auth.js API 엔드포인트
 */
const matchersForAuthJsApiEndpoint: string[] = [`${authConfig.basePath ?? '/api/auth'}{/*path}`];

/**
 * 제공된 ```pathname```이 ```matchers``` 배열에 있는 패턴 중 하나와 일치하는지 확인합니다.
 *
 * @param {string} pathname 평가할 경로 문자열입니다.
 * @param {Array<string>} matchers pathname과 비교할 패턴 배열입니다.
 * @returns {boolean} matchers 배열에 있는 패턴 중 하나라도 pathname과 일치하면 true를 반환합니다. 그렇지 않으면 false를 반환합니다.
 */
function isMatch(pathname: string, matchers: string[]): boolean {
  return matchers.some((item) => {
    return match(item)(pathname);
  });
}

/**
 * 개발 환경용 테스트 사용자 정보 생성
 */
function createDevUser(): User {
  // 환경변수에서 테스트 사용자 정보 가져오기
  const managerNo = Number(process.env.DEV_MANAGER_NO) || 1;
  const schoolNo = Number(process.env.DEV_SCHOOL_NO) || 0;
  const signInId = process.env.DEV_SIGNIN_ID || `test${managerNo}`;
  const name = process.env.DEV_NAME || `테스트${managerNo}`;

  return {
    managerNo,
    schoolNo,
    signInId,
    name,
  };
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log(`[middleware] ${request.method.toUpperCase()} ${pathname}${request.nextUrl.search}`);

  // Auth.js 용 URL 처리. 그냥 통과시켜야 합니다.
  if (isMatch(pathname, matchersForAuthJsApiEndpoint)) {
    return NextResponse.next();
  }

  // 로그인이 필요없는 URL 처리
  if (isMatch(pathname, [...matchersForPublic])) {
    return NextResponse.next();
  }

  // 세션 인증 확인
  const session = await auth();

  // 개발 환경에서 API 요청에 대해 세션 자동 설정
  if (process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1' && isMatch(pathname, ['/api{/*path}', '/test/api{/*path}'])) {
    // 개발 환경에서는 세션이 없어도 통과시키되, 헤더에 테스트 정보 추가
    const response = NextResponse.next();
    const devUser = createDevUser();
    // 한글 문자가 포함된 JSON을 base64로 인코딩하여 헤더에 설정
    const encodedSession = Buffer.from(JSON.stringify(devUser)).toString('base64');
    response.headers.set('x-dev-session', encodedSession);
    return response;
  }

  // 로그인이 필요한 페이지 처리
  if (!isMatch(pathname, [...matchersForSignInAndSignUp])) {
    // 로그인이 안 되어있으면 로그인 페이지에 콜백 URL을 넣어 리다이렉트
    if (!session) {
      const signInUrl = new URL(authConfig.pages?.signIn || '/auth/signin', request.nextUrl.origin);
      const callbackUrlEncoded = encodeURIComponent(request.url);
      signInUrl.searchParams.set('callbackUrl', callbackUrlEncoded);

      return NextResponse.redirect(signInUrl);
    }
  }

  // 로그인 관련 페이지 처리
  if (isMatch(pathname, [...matchersForSignInAndSignUp])) {
    // 로그인이 되어있으면 콜백 URL로 리다이렉트
    if (session) {
      const callbackUrl = decodeURIComponent(request.nextUrl.searchParams.get('callbackUrl') || '/');
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
  }

  return NextResponse.next();
}
