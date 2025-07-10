import { z } from 'zod';

/**
 * 총 페이지 수를 계산합니다.
 * @param {number} pageSize 페이지당 아이템 수
 * @param {number} total 총 아이템 수
 * @returns {number} 총 페이지 수
 */
export function calculateTotalPage(pageSize: number, total: number): number {
  if (total <= 0 || pageSize <= 0) {
    return 0;
  }
  return Math.ceil(total / pageSize);
}

/**
 * 응답이 JSON 형식인지 확인합니다.
 *
 * @param {Response} response 응답
 * @returns {boolean} 응답이 JSON 형식인지 여부
 */
export function isJsonResponse(response: Response): boolean {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return false;
  }
  return true;
}

export type ToCamelCase<T extends string> = T extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${ToCamelCase<P3>}`
  : Lowercase<T>;

export type CamelCaseKeys<T> = {
  [K in keyof T as ToCamelCase<K & string>]: T[K];
};

/**
 * 파스칼 케이스를 카멜 케이스로 변환한 스키마 생성
 *
 * @requires zod
 * @param schema 파스칼 케이스 스키마
 * @returns 카멜 케이스 스키마
 */
export const createCamelCaseSchema = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => {
  const camelCaseShape = Object.fromEntries(
    Object.entries(schema.shape).map(([key, value]) => {
      const splittedKey = key.toLowerCase().split('_');
      const newKey = splittedKey
        .map((word, i) => {
          if (i === 0) {
            return word;
          }
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join('');
      return [newKey, value];
    }),
  );
  return z.object(camelCaseShape) as unknown as z.ZodType<CamelCaseKeys<z.infer<typeof schema>>>;
};

/**
 * 파스칼 케이스를 카멜 케이스로 변환
 * @param {string} val 파스칼 케이스 문자열
 * @returns {string} 카멜 케이스 문자열
 */
export const convertPacalCaseToCamelCase = (val: string): string => {
  return val.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

export const preprocessArray = (val: unknown) => {
  if (val === undefined || val === null) {
    return [];
  }

  if (!Array.isArray(val)) {
    return [val];
  }
  return val;
};

type GetPaginationResult = {
  /**
   * 총 아이템 수
   */
  total: number;
  /**
   * 총 페이지 수
   */
  totalPage: number;
  /**
   * 시작 인덱스
   */
  startIndex: number;
  /**
   * 종료 인덱스
   */
  endIndex: number;
};

/**
 * 페이지네이션 정보 반환
 * @param items 아이템 목록
 * @param page 페이지 번호
 * @param pageSize 페이지 크기
 * @returns {GetPaginationResult} 페이지네이션 정보
 */
export const getPagination = (total: number, page: number, pageSize: number): GetPaginationResult => {
  const totalPage = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return {
    total,
    totalPage,
    startIndex,
    endIndex,
  };
};
