import '@testing-library/jest-dom';

// Next.js 서버 컴포넌트 모킹
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
    })),
  },
  NextRequest: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn((path) => {
    console.log(`Mock redirect to: ${path}`);
  }),
  permanentRedirect: jest.fn((path) => {
    console.log(`Mock permanent redirect to: ${path}`);
  }),
}));

// 전역 fetch 모킹
global.fetch = jest.fn();

// 전역 Request 모킹 (간단한 버전)
if (typeof global.Request === 'undefined') {
  global.Request = class MockRequest {
    url: string;
    options: RequestInit | undefined;
    constructor(url: string, options?: RequestInit) {
      this.url = url;
      this.options = options;
    }
  } as unknown as typeof Request;
}

// 전역 Response 모킹 (간단한 버전)
if (typeof global.Response === 'undefined') {
  global.Response = class MockResponse {
    status: number;
    body: BodyInit | null | undefined;
    constructor(body?: BodyInit | null, options?: ResponseInit) {
      this.body = body;
      this.status = options?.status || 200;
    }
    json() {
      return Promise.resolve(this.body);
    }
  } as unknown as typeof Response;
}
