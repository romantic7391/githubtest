import { z } from 'zod';
import { pageSizeSchema } from './common';
import { pageSchema } from './common';
import { CHILD_ESTABLISH_TYPE, KINDER_ESTABLISH_TYPE } from '@/lib/school-info.constant';
import { baseResultItemSchema } from './school';

/**
 * 시/도 코드. 행정표준코드 법정동코드 앞 2자리.
 */
export const sidoCodeSchema = z.coerce
  .number({
    invalid_type_error: '시/도 코드는 숫자여야 합니다.',
  })
  .int({
    message: '시/도 코드는 정수여야 합니다.',
  })
  .min(10, {
    message: '시/도 코드는 2자리 자연수여야 합니다.',
  })
  .max(99, {
    message: '시/도 코드는 2자리 자연수여야 합니다.',
  })
  .default(99)
  .nullish()
  .transform((val) => val ?? 99);

/**
 * 시/군/구 코드. 행정표준코드 법정동코드 앞 5자리.
 */
export const sggCodeSchema = z.coerce
  .number({
    invalid_type_error: '시/군/구 코드는 숫자여야 합니다.',
  })
  .int({
    message: '시/군/구 코드는 정수여야 합니다.',
  })
  .min(10000, {
    message: '시/군/구 코드는 5자리 자연수여야 합니다.',
  })
  .max(99999, {
    message: '시/군/구 코드는 5자리 자연수여야 합니다.',
  })
  .default(99)
  .nullish()
  .transform((val) => val ?? 99);

/**
 * 도로명.
 */
export const roSchema = z
  .string({
    invalid_type_error: '도로명은 문자열이어야 합니다.',
  })
  .nullish()
  .transform((val) => val ?? '99');

/**
 * 유치원 또는 어린이집 이름.
 */
export const organNameSchema = z
  .string({
    invalid_type_error: '유치원 또는 어린이집 이름은 문자열이어야 합니다.',
  })
  .nullish()
  .transform((val) => val ?? '');

/**
 * 탭 번호.
 * - 1: 전체
 * - 2: 유치원
 * - 3: 어린이집
 */
export const tabSchema = z.preprocess(
  (val) => {
    let _val = val;

    if (Array.isArray(_val) && _val.length >= 1) {
      _val = _val[0];
    }

    if (typeof _val === 'number') {
      _val = _val.toString();
    }

    if (typeof _val === 'string' && ['1', '2', '3'].includes(_val)) {
      return _val;
    }

    return '1';
  },
  z.enum(['1', '2', '3']).default('1'),
);

/**
 * 유치원 설립 유형
 * - 01: 국립
 * - 02: 공립(단설)
 * - 03: 공립(병설)
 * - 04: 사립(법인)
 * - 05: 사립(사인)
 */
const kinderEstablishArraySchema = z
  .array(z.enum(Object.keys(KINDER_ESTABLISH_TYPE) as [keyof typeof KINDER_ESTABLISH_TYPE]))
  .default([]);
export const kinderEstablishSchema = z.preprocess((val) => {
  let _val = val;
  if (typeof _val === 'string' || typeof _val === 'number') {
    _val = [_val];
  }

  if (!Array.isArray(_val)) {
    return [];
  }

  return _val
    .map((v) => {
      return v.toString().padStart(2, '0');
    })
    .filter((v) => {
      return Object.keys(KINDER_ESTABLISH_TYPE).includes(v);
    });
}, kinderEstablishArraySchema);

/**
 * 어린이집 설립 유형
 * - 101: 국공립
 * - 102: 사회복지법인
 * - 103: 법인·단체
 * - 104: 민간개인
 * - 105: 가정
 * - 106: 협동
 * - 107: 직장
 */
export const childEstablishSchema = z.preprocess(
  (val) => {
    let _val = val;
    if (typeof _val === 'string' || typeof _val === 'number') {
      _val = [_val];
    }

    if (Array.isArray(_val)) {
      return _val
        .map((v) => {
          return v.toString().padStart(2, '0');
        })
        .filter((v) => {
          return Object.keys(CHILD_ESTABLISH_TYPE).includes(v);
        });
    }

    return [];
  },
  z.array(z.enum(Object.keys(CHILD_ESTABLISH_TYPE) as [keyof typeof CHILD_ESTABLISH_TYPE])).default([]),
);

/**
 * 유치원 또는 어린이집 검색 요청 타입.
 */
export const kindergartenSearchSchema = z.object({
  /**
   * 시/도 코드. 행정표준코드 법정동코드 앞 2자리.
   */
  sidoCode: sidoCodeSchema,
  /**
   * 시/군/구 코드. 행정표준코드 법정동코드 앞 5자리.
   */
  sggCode: sggCodeSchema,
  /**
   * 도로명.
   */
  ro: roSchema,
  /**
   * 유치원 또는 어린이집 이름.
   */
  sname: organNameSchema,
  /**
   * 탭 번호.
   * - 1: 전체
   * - 2: 유치원
   * - 3: 어린이집
   */
  tab: tabSchema,
  /**
   * 유치원 설립 유형.
   * - 01: 국립
   * - 02: 공립(단설)
   * - 03: 공립(병설)
   * - 04: 사립(법인)
   * - 05: 사립(사인)
   */
  kinderEstablish: kinderEstablishSchema,
  /**
   * 어린이집 설립 유형.
   * - 101: 국공립
   * - 102: 사회복지법인
   * - 103: 법인·단체
   * - 104: 민간개인
   * - 105: 가정
   * - 106: 협동
   * - 107: 직장
   */
  childEstablish: childEstablishSchema,
  /**
   * 유치원 휴원 제외 여부.
   */
  isIncludeSuspension: z.boolean().optional().default(false),
  /**
   * 유치원 폐원 제외 여부.
   */
  isIncludeClosure: z.boolean().optional().default(false),
  /**
   * 유치원알리미의 유치원 또는 어린이집 코드.
   */
  ittld: z.string().optional().default(''),
  /**
   * 페이지 번호.
   */
  page: pageSchema,
  /**
   * 페이지 크기.
   */
  pageSize: pageSizeSchema,
});

/**
 * 유치원 또는 어린이집 검색 요청 타입.
 */
export type KindergartenSearch = z.infer<typeof kindergartenSearchSchema>;

export const childSchoolInfoSchema = baseResultItemSchema.extend({
  kinderCode: z.string(),
  sidoName: z.string(),
  sggName: z.string(),
  ro: z.string(),
});

export type ChildSchoolInfo = z.infer<typeof childSchoolInfoSchema>;
