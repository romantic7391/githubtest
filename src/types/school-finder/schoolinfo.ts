import { z } from 'zod';
import { convertPacalCaseToCamelCase, createCamelCaseSchema } from '@/lib/util/common.util';
import { baseResultItemSchema } from './school';

/**
 * @see [학교알리미 API](https://www.schoolinfo.go.kr/ng/go/pnnggo_a01_l0.do) 출력값 참고.
 */
export const schoolInfoRawSchema = z.object({
  /** 1. 시도교육청 */
  ATPT_OFCDC_ORG_NM: z.string(),
  /** 2. 시도교육청코드 */
  ATPT_OFCDC_ORG_CODE: z.string(),
  /** 3. 교육지원청 */
  JU_ORG_NM: z.string().optional(),
  /** 4. 교육지원청코드 */
  JU_ORG_CODE: z.string(),
  /** 5. 지역 */
  ADRCD_NM: z.string().optional(),
  /** 6. 지역코드 */
  ADRCD_CD: z.string().optional(),
  /** 7. 소재지구분코드 */
  LCTN_SC_CODE: z.string(),
  /** 8. 정보공시 학교코드 */
  SCHUL_CODE: z.string(),
  /** 9. 학교명 */
  SCHUL_NM: z.string(),
  /**
   * 10. 학교 구분 코드. 검색 시 학교 구분과 조금 다름.
   * - 02: 초등학교
   * - 03: 중학교
   * - 04: 고등학교 (일반고등학교, 특수목적고등학교)
   * - 05: 특수학교
   * - 07: 기타. 공민학교
   * - 08: 기타. 고등기술학교
   * - 09: 각종. 각종 중학교
   * - 10: 각종. 각종 고등학교
   * - 11: 기타. 방송통신고등학교
   * - 19: 각종. 각종 초등학교
   */
  SCHUL_KND_SC_CODE: z.string(),
  /** 11. 설립구분 */
  FOND_SC_CODE: z.string(),
  /** 14. 설립유형 */
  SCHUL_FOND_TYP_CODE: z.string().optional(),
  /** 15. 주야구분 */
  DGHT_SC_CODE: z.string(),
  /** 16. 개교기념일 */
  FOAS_MEMRD: z.string().optional(),
  /** 17. 설립일 */
  FOND_YMD: z.string().optional(),
  /** 18. 법정동코드 */
  ADRCD_ID: z.string().optional(),
  /** 19. 주소내역 */
  ADRES_BRKDN: z.string().optional(),
  /** 20. 상세주소내역 */
  DTLAD_BRKDN: z.string(),
  /** 21. 우편번호. 6자리 구 우편번호 */
  ZIP_CODE: z.string().optional(),
  /** 22. 학교도로명 우편번호 */
  SCHUL_RDNZC: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim() : undefined)),
  /** 23. 학교도로명 주소 */
  SCHUL_RDNMA: z.string().optional(),
  /** 24. 학교도로명 상세주소 */
  SCHUL_RDNDA: z.string().optional(),
  /** 25. 위도 */
  LTTUD: z.number().optional(),
  /** 26. 경도 */
  LGTUD: z.number().optional(),
  /** 27. 전화번호 */
  USER_TELNO: z.string(),
  /** 28. 전화번호(교무실) */
  USER_TELNO_SW: z.string().optional(),
  /** 29. 전화번호(행정실) */
  USER_TELNO_GA: z.string().optional(),
  /** 30. 팩스번호 */
  PERC_FAXNO: z.string().optional(),
  /** 31. 홈페이지 주소 */
  HMPG_ADRES: z.string().optional(),
  /** 32. 남녀공학 구분 */
  COEDU_SC_CODE: z.string().optional(),
  /** 33. 폐교여부 */
  ABSCH_YN: z.string(),
  /** 34. 폐교일자 */
  ABSCH_YMD: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim() : undefined)),
  /** 35. 휴교여부 */
  CLOSE_YN: z.string(),
  /** 36. 학교과정구분값(2-3-4) */
  SCHUL_CRSE_SC_VALUE: z.string().optional(),
  /** 37. 학교과정구분명(초-중-고) */
  SCHUL_CRSE_SC_VALUE_NM: z.string().optional(),
  /** 13. 분교여부 */
  BNHH_YN: z.string(),
});
export type SchoolInfoRaw = z.infer<typeof schoolInfoRawSchema>;

export const schoolInfoSchemaCamelCase = createCamelCaseSchema(schoolInfoRawSchema);

/**
 * 파스칼 케이스로 들어온 데이터를 카멜 케이스로 변환하여 사용
 */
export const schoolInfoCamelCaseSchema = schoolInfoRawSchema.transform((obj) => {
  const entries = Object.entries(obj).map(([key, value]) => {
    return [convertPacalCaseToCamelCase(key), value];
  });
  const newObj = Object.fromEntries(entries);
  return newObj;
});
export type SchoolInfoCamelCase = z.infer<typeof schoolInfoCamelCaseSchema>;

export const schoolInfoSchema = baseResultItemSchema.extend({
  zipCode: schoolInfoRawSchema.shape.ZIP_CODE,
  closureDate: z.string().optional(),
  coordinate: z.object({
    type: z.literal('WGS84'),
    latitude: schoolInfoRawSchema.shape.LTTUD,
    longitude: schoolInfoRawSchema.shape.LGTUD,
  }),
  raw: schoolInfoRawSchema.optional(),
});
export type SchoolInfo = z.infer<typeof schoolInfoSchema>;
