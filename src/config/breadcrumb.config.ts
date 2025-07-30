/**
 * 브레드크럼 네비게이션 설정
 *
 * 각 경로에 대한 브레드크럼 정보를 정의합니다.
 * path: URL 경로 패턴
 * segments: 브레드크럼 세그먼트 배열
 *   - label: 표시될 텍스트
 *   - href: 링크 URL (동적 파라미터는 {paramName} 형태로 표시)
 *   - isDynamic: 동적 파라미터 여부
 */

export interface BreadcrumbSegment {
  label: string;
  href: string;
  isDynamic?: boolean;
}

export interface BreadcrumbConfig {
  path: string;
  segments: BreadcrumbSegment[];
}

export const breadcrumbConfigs: BreadcrumbConfig[] = [
  // 메인 페이지
  {
    path: '/',
    segments: [{ label: '메인', href: '/' }],
  },

  // 지역 관련
  {
    path: '/areas',
    segments: [
      { label: '메인', href: '/' },
      { label: '지역', href: '/areas' },
    ],
  },

  // 학교 목록
  {
    path: '/areas/[area]/schools',
    segments: [
      { label: '메인', href: '/' },
      { label: '지역', href: '/areas' },
      { label: '학교 목록', href: '/areas/{area}/schools', isDynamic: true },
    ],
  },

  // 학교 생성
  {
    path: '/areas/[area]/schools/create',
    segments: [
      { label: '메인', href: '/' },
      { label: '지역', href: '/areas' },
      { label: '학교 목록', href: '/areas/{area}/schools', isDynamic: true },
      { label: '학교 추가', href: '/areas/{area}/schools/create', isDynamic: true },
    ],
  },

  // 학교 상세 (기본 정보 탭)
  {
    path: '/areas/[area]/schools/[schoolNo]',
    segments: [
      { label: '메인', href: '/' },
      { label: '지역', href: '/areas' },
      { label: '학교 목록', href: '/areas/{area}/schools', isDynamic: true },
      { label: '학교 정보', href: '/areas/{area}/schools/{schoolNo}', isDynamic: true },
    ],
  },

  // 학교 탭 페이지들
  {
    path: '/areas/[area]/schools/[schoolNo]/info',
    segments: [
      { label: '메인', href: '/' },
      { label: '지역', href: '/areas' },
      { label: '학교 목록', href: '/areas/{area}/schools', isDynamic: true },
      { label: '학교 정보', href: '/areas/{area}/schools/{schoolNo}', isDynamic: true },
      { label: '기본 정보', href: '/areas/{area}/schools/{schoolNo}/info', isDynamic: true },
    ],
  },

  {
    path: '/areas/[area]/schools/[schoolNo]/groups',
    segments: [
      { label: '메인', href: '/' },
      { label: '지역', href: '/areas' },
      { label: '학교 목록', href: '/areas/{area}/schools', isDynamic: true },
      { label: '학교 정보', href: '/areas/{area}/schools/{schoolNo}', isDynamic: true },
      { label: '그룹', href: '/areas/{area}/schools/{schoolNo}/groups', isDynamic: true },
    ],
  },

  {
    path: '/areas/[area]/schools/[schoolNo]/managers',
    segments: [
      { label: '메인', href: '/' },
      { label: '지역', href: '/areas' },
      { label: '학교 목록', href: '/areas/{area}/schools', isDynamic: true },
      { label: '학교 정보', href: '/areas/{area}/schools/{schoolNo}', isDynamic: true },
      { label: '사용자', href: '/areas/{area}/schools/{schoolNo}/managers', isDynamic: true },
    ],
  },

  {
    path: '/areas/[area]/schools/[schoolNo]/devices',
    segments: [
      { label: '메인', href: '/' },
      { label: '지역', href: '/areas' },
      { label: '학교 목록', href: '/areas/{area}/schools', isDynamic: true },
      { label: '학교 정보', href: '/areas/{area}/schools/{schoolNo}', isDynamic: true },
      { label: '센서 장치', href: '/areas/{area}/schools/{schoolNo}/devices', isDynamic: true },
    ],
  },

  // 학교 탭 하위 페이지들
  {
    path: '/areas/[area]/schools/[schoolNo]/groups/create',
    segments: [
      { label: '메인', href: '/' },
      { label: '지역', href: '/areas' },
      { label: '학교 목록', href: '/areas/{area}/schools', isDynamic: true },
      { label: '학교 정보', href: '/areas/{area}/schools/{schoolNo}', isDynamic: true },
      { label: '그룹', href: '/areas/{area}/schools/{schoolNo}/groups', isDynamic: true },
      { label: '그룹 추가', href: '/areas/{area}/schools/{schoolNo}/groups/create', isDynamic: true },
    ],
  },

  {
    path: '/areas/[area]/schools/[schoolNo]/managers/create',
    segments: [
      { label: '메인', href: '/' },
      { label: '지역', href: '/areas' },
      { label: '학교 목록', href: '/areas/{area}/schools', isDynamic: true },
      { label: '학교 정보', href: '/areas/{area}/schools/{schoolNo}', isDynamic: true },
      { label: '사용자', href: '/areas/{area}/schools/{schoolNo}/managers', isDynamic: true },
      { label: '사용자 추가', href: '/areas/{area}/schools/{schoolNo}/managers/create', isDynamic: true },
    ],
  },

  {
    path: '/areas/[area]/schools/[schoolNo]/devices/create',
    segments: [
      { label: '메인', href: '/' },
      { label: '지역', href: '/areas' },
      { label: '학교 목록', href: '/areas/{area}/schools', isDynamic: true },
      { label: '학교 정보', href: '/areas/{area}/schools/{schoolNo}', isDynamic: true },
      { label: '센서 장치', href: '/areas/{area}/schools/{schoolNo}/devices', isDynamic: true },
      { label: '센서 추가', href: '/areas/{area}/schools/{schoolNo}/devices/create', isDynamic: true },
    ],
  },

  // 사용자 관련 페이지들
  {
    path: '/areas/[area]/schools/[schoolNo]/managers/[managerNo]',
    segments: [
      { label: '메인', href: '/' },
      { label: '지역', href: '/areas' },
      { label: '학교 목록', href: '/areas/{area}/schools', isDynamic: true },
      { label: '학교 정보', href: '/areas/{area}/schools/{schoolNo}', isDynamic: true },
      { label: '사용자', href: '/areas/{area}/schools/{schoolNo}/managers', isDynamic: true },
      { label: '사용자 정보', href: '/areas/{area}/schools/{schoolNo}/managers/{managerNo}', isDynamic: true },
    ],
  },

  {
    path: '/areas/[area]/schools/[schoolNo]/managers/create',
    segments: [
      { label: '메인', href: '/' },
      { label: '지역', href: '/areas' },
      { label: '학교 목록', href: '/areas/{area}/schools', isDynamic: true },
      { label: '학교 정보', href: '/areas/{area}/schools/{schoolNo}', isDynamic: true },
      { label: '사용자', href: '/areas/{area}/schools/{schoolNo}/managers', isDynamic: true },
      { label: '사용자 추가', href: '/areas/{area}/schools/{schoolNo}/managers/create', isDynamic: true },
    ],
  },

  // 권한 관련
  {
    path: '/permissions',
    segments: [
      { label: '메인', href: '/' },
      { label: '권한', href: '/permissions' },
    ],
  },

  {
    path: '/permissions/create',
    segments: [
      { label: '메인', href: '/' },
      { label: '권한', href: '/permissions' },
      { label: '권한 추가', href: '/permissions/create' },
    ],
  },

  {
    path: '/permissions/[permissionNo]',
    segments: [
      { label: '메인', href: '/' },
      { label: '권한', href: '/permissions' },
      { label: '권한 정보', href: '/permissions/{permissionNo}', isDynamic: true },
    ],
  },

  // 이력 관련
  {
    path: '/history',
    segments: [
      { label: '메인', href: '/' },
      { label: '이력', href: '/history' },
    ],
  },

  {
    path: '/history/tasks',
    segments: [
      { label: '메인', href: '/' },
      { label: '이력', href: '/history' },
      { label: '작업 이력', href: '/history/tasks' },
    ],
  },

  {
    path: '/history/signins',
    segments: [
      { label: '메인', href: '/' },
      { label: '이력', href: '/history' },
      { label: '로그인 이력', href: '/history/signins' },
    ],
  },

  {
    path: '/history/tasks/[historyNo]',
    segments: [
      { label: '메인', href: '/' },
      { label: '이력', href: '/history' },
      { label: '작업 이력', href: '/history/tasks' },
      { label: '작업 상세', href: '/history/tasks/{historyNo}', isDynamic: true },
    ],
  },

  {
    path: '/history/signins/[historyNo]',
    segments: [
      { label: '메인', href: '/' },
      { label: '이력', href: '/history' },
      { label: '로그인 이력', href: '/history/signins' },
      { label: '로그인 상세', href: '/history/signins/{historyNo}', isDynamic: true },
    ],
  },
];

/**
 * 현재 경로에 맞는 브레드크럼 설정을 찾습니다.
 *
 * @param pathname 현재 경로
 * @returns 브레드크럼 설정 또는 null
 */
export function findBreadcrumbConfig(pathname: string): BreadcrumbConfig | null {
  // 정확한 매칭을 위해 경로를 정규화
  const normalizedPathname = pathname.replace(/\/$/, '');

  for (const config of breadcrumbConfigs) {
    // 동적 파라미터를 정규식으로 변환
    const pattern = config.path
      .replace(/\[([^\]]+)\]/g, '[^/]+') // [param] -> [^/]+
      .replace(/\//g, '\\/'); // / -> \/

    const regex = new RegExp(`^${pattern}$`);

    if (regex.test(normalizedPathname)) {
      return config;
    }
  }

  return null;
}

/**
 * 동적 파라미터를 실제 값으로 치환합니다.
 *
 * @param href 원본 href
 * @param params 파라미터 객체
 * @returns 치환된 href
 */
export function replaceDynamicParams(href: string, params: Record<string, string>): string {
  let result = href;

  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`{${key}}`, value);
  }

  return result;
}
