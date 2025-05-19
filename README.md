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

| 옵션              | 설명                    |
| :---------------- | :---------------------- |
| `NEXT_PUBLIC_URL` | 프로젝트 URL (테스트용) |
| `PORT`            | 서버 포트               |

### DB 설정

| 옵션               | 설명                        |
| :----------------- | :-------------------------- |
| `MARIADB_HOST`     | MariaDB 호스트 주소         |
| `MARIADB_USER`     | MariaDB 사용자 이름         |
| `MARIADB_PASSWORD` | MariaDB 비밀번호            |
| `MARIADB_DATABASE` | MariaDB 데이터베이스 이름   |
| `MARIADB_PORT`     | MariaDB 포트 (기본값: 3306) |

### Auth.js (next-auth) 설정

| 옵션          | 설명                                               |
| :------------ | :------------------------------------------------- |
| `AUTH_TRUST`  | 인증 신뢰 여부. 항상 true여야 합니다. (true/false) |
| `AUTH_SECRET` | 인증 암호화 비밀키                                 |

### Playwright 통합 테스트 설정

| 옵션                         | 설명                         |
| :--------------------------- | :--------------------------- |
| `PLAYWRIGHT_HTML_OUTPUT_DIR` | 통합 테스트 보고서 경로 설정 |

## 스택

### Next.js

Next.js ([링크](https://nextjs.org/docs))

### UI

mantine v8.0.0 ([링크](https://mantine.dev/getting-started/))

### 프론트엔드 데이터 처리

- Tanstack Query ([링크](https://tanstack.com/query/latest/docs/framework/react/overview))
- Fetch API ([링크](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API))
