# 공기질 관리자 페이지

## 프로젝트 실행

| 명령어                     | 역할                        |
| :------------------------- | :-------------------------- |
| `pnpm run dev`             | 개발 모드 실행              |
| `pnpm run build`           | 빌드                        |
| `pnpm run start`           | 실행                        |
| `pnpm run lint`            | ESLint                      |
| `pnpm run prettier`        | 코드 정렬                   |
| `pnpm run test`            | 유닛 테스트                 |
| `pnpm run test:report`     | 유닛 테스트 커버리지 보고서 |
| `pnpm run test:e2e`        | 통합 테스트                 |
| `pnpm run test:e2e-report` | 통합 테스트 보고서          |

## 환경설정

`.env` 파일 설정 목록입니다.

### 프로젝트 설정

| 옵션                           | 설명                                                                                        |
| :----------------------------- | :------------------------------------------------------------------------------------------ |
| `TZ`                           | 타임존 설정.                                                                                |
| `NODE_TLS_REJECT_UNAUTHORIZED` | `UNABLE_TO_VERIFY_LEAF_SIGNATURE` 에러 발생 시 `0`으로 설정하세요. (활성: `1`, 비활성: `0`) |
| `NEXT_PUBLIC_URL`              | 프로젝트 URL (테스트용)                                                                     |
| `PORT`                         | 서버 포트                                                                                   |

### DB 설정

| 옵션               | 설명                        |
| :----------------- | :-------------------------- |
| `MARIADB_HOST`     | MariaDB 호스트 주소         |
| `MARIADB_USER`     | MariaDB 사용자 이름         |
| `MARIADB_PASSWORD` | MariaDB 비밀번호            |
| `MARIADB_DATABASE` | MariaDB 데이터베이스 이름   |
| `MARIADB_PORT`     | MariaDB 포트 (기본값: 3306) |

### Auth.js (next-auth) 설정

| 옵션          | 설명                                                      |
| :------------ | :-------------------------------------------------------- |
| `AUTH_TRUST`  | 인증 신뢰 여부. 항상 `true`이어야 합니다.                 |
| `AUTH_SECRET` | 인증 암호화 비밀키 (참고: [링크](https://cli.authjs.dev)) |

### Playwright 통합 테스트 설정

| 옵션                         | 설명                         |
| :--------------------------- | :--------------------------- |
| `PLAYWRIGHT_HTML_OUTPUT_DIR` | 통합 테스트 보고서 경로 설정 |

### 개발용 설정

| 옵션                             | 설명                                                                               |
| :------------------------------- | :--------------------------------------------------------------------------------- |
| `MARIADB_CONN_LOG`               | 커넥션 로그 설정. (활성: `1`, 비활성: `0`)                                         |
| `WORKING_ON_BACKEND_DEVELOPMENT` | 백엔드 개발 중 API 요청 시 미들웨어 인증 검사 우회 플래그 (활성: `1`, 비활성: `0`) |

## 스택

### Next.js

Next.js ([링크](https://nextjs.org/docs))

### UI

mantine v8.0.0 ([링크](https://mantine.dev/getting-started/))

### 프론트엔드 데이터 처리

- Tanstack Query ([링크](https://tanstack.com/query/latest/docs/framework/react/overview))
- Fetch API ([링크](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API))

### 로그인 처리

- Auth.js ([링크](https://authjs.dev/getting-started))
