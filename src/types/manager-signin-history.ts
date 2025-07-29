import { z } from 'zod';
import ip from 'ip';
import { managerSchema } from './manager';
import { datetimeSchema, ynSchema } from './common';

export const managerSignInHistorySchema = z.object({
  historyNo: z.number().optional(),
  managerNo: managerSchema.shape.managerNo,
  signInTime: datetimeSchema,
  signOutTime: datetimeSchema.nullable(),
  success: ynSchema,
  remoteAddr: z.union([
    // 1. 입력이 문자열일 경우
    z
      .string()
      .ip({ version: 'v4', message: 'IP 주소는 IPv4 형식이어야 합니다.' })
      .transform((v) => ip.toLong(v)),

    // 2. 입력이 숫자일 경우
    z
      .number()
      .int({ message: 'IP 숫자 값은 정수여야 합니다.' })
      .min(0, { message: 'IP 숫자 값은 0 이상이어야 합니다.' })
      .max(4294967295, { message: '유효한 IPv4 숫자 범위를 벗어났습니다.' }),
  ]),
  signInId: managerSchema.shape.signInId.nullable(),
});
export type ManagerSignInHistory = z.infer<typeof managerSignInHistorySchema>;
