import fs from 'fs';
import path from 'path';

const LOG_PREFIX = '[utils][cache]';

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
    console.error(`${LOG_PREFIX} Failed to create cache directory:`, error);
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
        console.log(`${LOG_PREFIX} Cache file created successfully: ${filePath}`);
        resolve();
      });
      writeStream.on('error', (error) => {
        console.error(`${LOG_PREFIX} Failed to write cache file:`, error);
        reject(error);
      });
    });
  } catch (error) {
    console.error(`${LOG_PREFIX} Failed to process data:`, error);
    throw error;
  }
};
