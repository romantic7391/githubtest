/**
 * common, cache 유틸 통합
 */

import { z } from 'zod';
import path from 'path';
import fs from 'fs';

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

export const ROOT = path.resolve(process.cwd(), '.');
export const CACHE_ROOT = path.join(ROOT, '_', 'cache');
export const CACHE_TTL = process.env.CACHE_TTL ? Number(process.env.CACHE_TTL) * 1000 : 1000 * 60 * 60 * 24;

export const isExistsPath = async (path: string) => {
  try {
    await fs.promises.access(path);
    return true;
  } catch {
    return false;
  }
};

/**
 * 캐시 디렉토리를 생성합니다.
 *
 * @param {string} dirName 캐시 디렉토리 이름
 * @returns {Promise<string>} 캐시 디렉토리 경로
 */
export const createCacheDir = async (dirName?: string): Promise<string> => {
  try {
    const cacheDir = dirName ? path.join(CACHE_ROOT, dirName) : CACHE_ROOT;
    await fs.promises.mkdir(cacheDir, { recursive: true });
    return cacheDir;
  } catch (error) {
    console.error(`Failed to create cache directory:`, error);
    throw error;
  }
};

export const createLargeJsonCacheFile = async (fileName: string, generator: AsyncGenerator<object>) => {
  const cacheDir = await createCacheDir(path.dirname(fileName));

  try {
    const filePath = path.join(cacheDir, path.basename(fileName));
    const writeStream = fs.createWriteStream(filePath, { encoding: 'utf-8' });

    let isFirstChunk = true;
    let previousData: object | null = null;

    // 마지막 전 항목 처리
    for await (const data of generator) {
      if (isFirstChunk) {
        isFirstChunk = false;
        writeStream.write('[\n');
      } else if (previousData) {
        writeStream.write('\t' + JSON.stringify(previousData) + ',\n');
      }
      previousData = data;
    }

    // 마지막 항목 처리 (쉼표 없이)
    if (previousData) {
      writeStream.write('\t' + JSON.stringify(previousData) + '\n');
    }

    writeStream.write(']');
    writeStream.end();

    return new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => {
        console.log(`Cache file created successfully: ${filePath}`);
        resolve();
      });
      writeStream.on('error', (error) => {
        console.error(`Failed to write cache file:`, error);
        reject(error);
      });
    });
  } catch (error) {
    console.error(`Failed to process data:`, error);
    throw error;
  }
};
