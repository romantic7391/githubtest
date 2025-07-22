import { z } from 'zod';
import { REGEX_ALPHANUMERIC, REGEX_ALPHABET_NUMBER_SPECIAL, ALLOWED_SPECIAL_CHARACTERS } from '@/lib/regex.constant';
import { baseApiResponseSchema, datetimeSchema, paginationSchema } from './common';
import { schoolSchema } from './school';

export const managerSchema = z.object({
  managerNo: z.number().int().nonnegative(),
  schoolNo: schoolSchema.shape.schoolNo,
  signInId: z
    .string()
    .min(1, '아이디는 필수입니다.')
    .regex(REGEX_ALPHANUMERIC, '아이디는 영문, 숫자만 사용할 수 있습니다.')
    .max(16, '아이디는 최대 16자까지 입력할 수 있습니다.'),
  name: z.string().min(1, '이름은 필수입니다.').max(10, '이름은 최대 20자까지 입력할 수 있습니다.'),
  lastPasswordChanged: datetimeSchema.nullable(),
  signInAttpemptCount: z.number().int().nonnegative(),
  approvedStatus: z.string(),
  locked: z.enum(['Y', 'N']),
  created: datetimeSchema,
  updated: datetimeSchema,
});
export type Manager = z.infer<typeof managerSchema>;

export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 8자 이상이어야 합니다.')
  .max(20, '비밀번호는 최대 20자까지 입력할 수 있습니다.')
  .regex(
    REGEX_ALPHABET_NUMBER_SPECIAL,
    `비밀번호는 영문, 숫자, 특수문자(${ALLOWED_SPECIAL_CHARACTERS})만 사용할 수 있습니다.`,
  )
  .superRefine((value, ctx) => {
    const length = value.length;

    // 대문자 포함 여부
    const hasUppercase = /[A-Z]/.test(value);

    // 소문자 포함 여부
    const hasLowercase = /[a-z]/.test(value);

    // 숫자 포함 여부
    const hasNumber = /[0-9]/.test(value);

    // 특수문자 포함 여부
    const hasSpecialCharacter = /[!@#$%^&*]/.test(value);

    // 문자 종류 개수
    const typeCount = [hasUppercase, hasLowercase, hasNumber, hasSpecialCharacter].filter(Boolean).length;

    // 비밀번호가 8자리 이상 10자리 미만일 때
    if (8 <= length && length < 10) {
      // 3종류 미만 문자 조합일 때
      if (typeCount < 3) {
        if (!hasUppercase) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: '비밀번호는 대문자를 포함해야 합니다.' });
        }
        if (!hasLowercase) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: '비밀번호는 소문자를 포함해야 합니다.' });
        }
        if (!hasNumber) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: '비밀번호는 숫자를 포함해야 합니다.' });
        }
        if (!hasSpecialCharacter) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: '비밀번호는 특수문자를 포함해야 합니다.' });
        }
      }
    }
    // 비밀번호가 10자리 이상일 때
    else if (10 <= length) {
      // 2종류 미만 문자 조합일 때
      if (typeCount < 2) {
        if (!hasUppercase) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: '비밀번호는 대문자를 포함해야 합니다.' });
        }
        if (!hasLowercase) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: '비밀번호는 소문자를 포함해야 합니다.' });
        }
        if (!hasNumber) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: '비밀번호는 숫자를 포함해야 합니다.' });
        }
        if (!hasSpecialCharacter) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: '비밀번호는 특수문자를 포함해야 합니다.' });
        }
      }
    }
  });
export type Password = z.infer<typeof passwordSchema>;

export const managerSignUpSchema = managerSchema.pick({ signInId: true, name: true }).extend({
  password: passwordSchema,
  schoolNo: schoolSchema.shape.schoolNo,
  parentGroupNo: z.coerce.number().int().nonnegative().optional(),
});
export type ManagerSignUp = z.infer<typeof managerSignUpSchema>;

export const insertManagerDtoSchema = managerSchema
  .pick({
    signInId: true,
    schoolNo: true,
    name: true,
  })
  .extend({
    salt: z.string(),
    hashedPassword: z.string(),
  });
export type InsertManagerDto = z.infer<typeof insertManagerDtoSchema>;

export const findManagersDtoSchema = z.object({
  pagination: paginationSchema,
  filters: z.object({
    name: z.string().optional(),
    signInId: z.string().optional(),
    schoolNo: z.number().int().nonnegative().optional(),
    scode: schoolSchema.shape.scode.optional(),
    area: z.string().optional(),
  }),
});
export type FindManagersDto = z.infer<typeof findManagersDtoSchema>;

export const managerListApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    managers: z.array(managerSchema),
    pagination: paginationSchema,
  }),
});
export type ManagerListApiResponse = z.infer<typeof managerListApiResponseSchema>;

export const managerListRouteParamsSchema = z.object({
  params: z.promise(
    z.object({
      area: z.string(),
      schoolNo: z.union([z.literal('all'), z.coerce.number().int().nonnegative()]),
    }),
  ),
});

export type ManagerListRouteParams = z.infer<typeof managerListRouteParamsSchema>;

export const managerRouteParamsSchema = z.object({
  params: z.promise(
    z.object({
      managerNo: z.coerce.number().int().nonnegative(),
    }),
  ),
});
export type ManagerRouteParams = z.infer<typeof managerRouteParamsSchema>;

export const updateManagerDtoSchema = managerSchema
  .pick({
    managerNo: true,
    name: true,
    approvedStatus: true,
    locked: true,
  })
  .extend({
    password: passwordSchema.optional(),
  });
export type UpdateManagerDto = z.infer<typeof updateManagerDtoSchema>;

export const updatePasswordDtoSchema = z.object({
  managerNo: z.number().int().nonnegative(),
  password: passwordSchema,
  salt: z.string(),
});
export type UpdatePasswordDto = z.infer<typeof updatePasswordDtoSchema>;
