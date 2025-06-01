import { NextRequest, NextResponse } from 'next/server';
import { match } from 'path-to-regexp';
import { auth, config as authConfig } from '@/auth';

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

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log(`[middleware] ${request.method.toUpperCase()} ${pathname}${request.nextUrl.search}`);

  // 백엔드 작업 중이면 모든 API URL은 통과시킵니다.
  if (process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1') {
    if (isMatch(pathname, ['/api{/*path}', '/test/api{/*path}'])) {
      return NextResponse.next();
    }
  }

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
