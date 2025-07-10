import { z } from 'zod';
import { SCHOOL_TYPE_NAME_TO_CODE_MAP } from '@/lib/school-info.constant';
import { preprocessArray } from '@/lib/util/common.util';
import { pageSchema, pageSizeSchema, Pagination } from './common';

export const schoolTypeSchema = z.nativeEnum(SCHOOL_TYPE_NAME_TO_CODE_MAP, {
  required_error: '학교 구분을 선택해주십시오.',
});
export type SchoolType = z.infer<typeof schoolTypeSchema>;

// - 지역 영문명 검색 (e.g. seoul, daejeon, daegu, gwangmyeong, ...)
// - 지역 검색 (시/도, 시/군/구) (e.g. 서울, 대전, 대구, 경기도 광명시, ...)
// - 학교 구분 검색
// - 학교 이름 검색
export const schoolSearchSchema = z.object({
  /**
   * 지역 영문명 검색
   */
  areas: z.preprocess(
    preprocessArray,
    z.coerce
      .string()
      .regex(/^[a-z]+$/, {
        message: '지역 영문명은 알파벳 소문자로 입력해주십시오.',
      })
      .array()
      .optional(),
  ),
  /**
   * 지역 한글명 검색
   */
  areaKos: z.preprocess(
    preprocessArray,
    z.coerce
      .string()
      .regex(/^[가-힣\s]+$/, {
        message: '지역 한글명은 한글로 입력해주십시오.',
      })
      .array()
      .optional(),
  ),
  /**
   * 학교 구분 검색
   */
  stypes: z.preprocess(
    preprocessArray,
    z
      .nativeEnum(SCHOOL_TYPE_NAME_TO_CODE_MAP, {
        message: `학교 구분이 올바르지 않습니다. ${Object.entries(SCHOOL_TYPE_NAME_TO_CODE_MAP)
          .map(([name, code]) => `${name}(${code})`)
          .join(', ')} 중에서 선택해주십시오.`,
      })
      .array()
      .optional()
      .default([]),
  ),
  /**
   * 학교 이름 검색
   */
  snames: z.preprocess(preprocessArray, z.coerce.string().array().optional()),
  /**
   * 페이지 번호
   */
  page: pageSchema,
  /**
   * 페이지 크기
   */
  pageSize: pageSizeSchema,
});

export type SchoolSearch = z.infer<typeof schoolSearchSchema>;

export const baseResultItemSchema = z.object({
  sname: z.string(),
  scode: z.string(),
  stype: z.string(),
  established: z.string().optional(),
  establishType: z.string().optional(),
  phone: z.string(),
  address: z.string(),
  isSuspension: z.boolean(),
  isClosure: z.boolean(),
  administrationCode: z.string().optional(),
});
export type BaseResultItem = z.infer<typeof baseResultItemSchema>;

export interface BaseResult {
  items: BaseResultItem[];
  pagination: Pagination;
}
