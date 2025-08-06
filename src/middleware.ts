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
const matchersForPublic: string[] = ['/logo.svg', '/api/signin', '/api/signup', '/api/duplicate-check/:signInId'];

/**
 * 로그인, 회원가입 페이지 및 관련 엔드포인트 URL
 */
const matchersForSignInAndSignUp: string[] = ['/auth/signin', '/auth/signup'];

/**
 * Auth.js API 엔드포인트
 */
const matchersForAuthJsApiEndpoint: string[] = [`${authConfig.basePath ?? '/api/auth'}{/*path}`];

/**
 * CORS 헤더를 설정합니다.
 */
function setCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const allowedOrigins: string[] = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.11.11:3000',
    'http://nextjs.localhost',
    'https://nextjs.localhost',
  ];
  const origin = request.headers.get('origin');
  const allowedOrigin = allowedOrigins.includes(origin || '') ? origin : allowedOrigins[0];

  // credentials가 true일 때는 origin을 '*'로 설정할 수 없음
  if (allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  } else {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name',
  );
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24시간

  // 개발 환경에서 추가 디버깅 정보
  if (process.env.NODE_ENV === 'development') {
    console.log('CORS Headers set for:', {
      origin,
      allowedOrigin,
      method: request.method,
      pathname: request.nextUrl.pathname,
    });
  }

  return response;
}

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

  // OPTIONS 요청 처리 (CORS preflight)
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    return setCorsHeaders(request, response);
  }

  // Auth.js 용 URL 처리. 그냥 통과시켜야 합니다.
  if (isMatch(pathname, matchersForAuthJsApiEndpoint)) {
    const response = NextResponse.next();
    return setCorsHeaders(request, response);
  }

  // 로그인이 필요없는 URL 처리
  if (isMatch(pathname, [...matchersForPublic])) {
    const response = NextResponse.next();
    return setCorsHeaders(request, response);
  }

  // 세션 인증 확인
  let session = await auth();
  // 개발 모드일 때, 테스트 세션 주입.
  if (
    !session &&
    process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1' &&
    isMatch(pathname, ['/api{/*path}', '/test/api{/*path}'])
  ) {
    session = {
      user: {
        managerNo: Number(process.env.DEV_MANAGER_NO) || 1,
        schoolNo: Number(process.env.DEV_SCHOOL_NO) || 0,
        signInId: 'test',
        name: '테스트',
      },
      expires: new Date(Date.now() + (authConfig.session?.maxAge ?? 0) * 1000).toISOString(),
    };
  }

  // 로그인이 필요한 페이지 처리
  if (!isMatch(pathname, [...matchersForSignInAndSignUp])) {
    // 로그인이 안 되어있으면 로그인 페이지에 콜백 URL을 넣어 리다이렉트
    if (!session) {
      const signInUrl = new URL(authConfig.pages?.signIn || '/auth/signin', request.nextUrl.origin);
      const callbackUrlEncoded = encodeURIComponent(request.url);
      signInUrl.searchParams.set('callbackUrl', callbackUrlEncoded);

      const response = NextResponse.redirect(signInUrl);
      return setCorsHeaders(request, response);
    }
  }

  // 로그인 관련 페이지 처리
  if (isMatch(pathname, [...matchersForSignInAndSignUp])) {
    // 로그인이 되어있으면 콜백 URL로 리다이렉트
    if (session) {
      const callbackUrl = decodeURIComponent(request.nextUrl.searchParams.get('callbackUrl') || '/');
      const response = NextResponse.redirect(new URL(callbackUrl, request.url));
      return setCorsHeaders(request, response);
    }
  }

  const response = NextResponse.next();
  return setCorsHeaders(request, response);
}
