export const SCHOOL_TYPE_NAME_TO_CODE_MAP = {
  어린이집: '00',
  유치원: '01',
  초등학교: '02',
  중학교: '03',
  고등학교: '04',
  특수학교: '05',
  그외: '06',
  각종학교: '07',
} as const;

export const SCHOOL_TYPE_CODE_TO_NAME_MAP = Object.fromEntries(
  Object.entries(SCHOOL_TYPE_NAME_TO_CODE_MAP).map(([key, value]) => [value, key]),
);

export const KINDERGARTEN_TYPE = [
  SCHOOL_TYPE_NAME_TO_CODE_MAP['유치원'],
  SCHOOL_TYPE_NAME_TO_CODE_MAP['어린이집'],
] as string[];

export const SCHOOL_TYPE = Object.values(SCHOOL_TYPE_NAME_TO_CODE_MAP).filter((value) => {
  return !KINDERGARTEN_TYPE.includes(value);
});

/**
 * 학교 설립 유형
 */
export const SCHOOL_ESTABLISH_TYPE = {
  '10': '국립',
  '11': '국립(단설)',
  '12': '국립(부설)',
  '13': '국립(부속)',
  '20': '공립',
  '21': '공립(단설)',
  '22': '공립(부설)',
  '23': '공립(부속)',
  '24': '공립(병설)',
  '30': '사립',
  '31': '사립(단설)',
  '32': '사립(부설)',
  '33': '사립(부속)',
  '34': '사립(병설)',
} as const;

/**
 * 유치원 설립 유형
 */
export const KINDER_ESTABLISH_TYPE = {
  '01': '국립',
  '02': '공립(단설)',
  '03': '공립(병설)',
  '04': '사립(법인)',
  '05': '사립(사인)',
} as const;

/**
 * 유치원 국공립 설립 유형.
 */
export const PUBLIC_KINDER_ESTABLISH_TYPE = ['01', '02', '03'];

/**
 * 유치원 사립 설립 유형.
 */
export const PRIVATE_KINDER_ESTABLISH_TYPE = Object.keys(KINDER_ESTABLISH_TYPE).filter(
  (key) => !PUBLIC_KINDER_ESTABLISH_TYPE.includes(key),
);

/**
 * 어린이집 설립 유형
 */
export const CHILD_ESTABLISH_TYPE = {
  '101': '국공립',
  '102': '사회복지법인',
  '103': '법인·단체',
  '104': '민간개인',
  '105': '가정',
  '106': '협동',
  '107': '직장',
} as const;

/**
 * 어린이집 국공립 설립 유형.
 */
export const PUBLIC_CHILD_ESTABLISH_TYPE = ['101'];
/**
 * 어린이집 사립 설립 유형.
 */
export const PRIVATE_CHILD_ESTABLISH_TYPE = Object.keys(CHILD_ESTABLISH_TYPE).filter(
  (key) => !PUBLIC_CHILD_ESTABLISH_TYPE.includes(key),
);
