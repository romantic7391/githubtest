'use client';

import useCheckSignIdDuplicate from '@/app/(beforeSignIn)/auth/signup/_hooks/useCheckSignIdDuplicate';
import useSignUp from '@/app/(beforeSignIn)/auth/signup/_hooks/useSignUp';
import { managerSignUpSchema } from '@/types/manager';
import { showError } from '@/utils/common.util';
import { Alert, Button, Group, PasswordInput, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import AuthLoadingOverlay from '@/app/(beforeSignIn)/auth/_components/AuthLoadingOverlay';
import { IconAlertCircleFilled } from '@tabler/icons-react';
import useFilteredGroups from '../../../groups/_hooks/useFilteredGroups';
import { notifications } from '@mantine/notifications';

export default function ManagerCreateForm({ area, schoolNo }: { area: string; schoolNo: number }) {
  const router = useRouter();
  const {
    mutate: checkSignIdDuplicate,
    data: duplicateCheckResult,
    isPending: isCheckSignIdDuplicateLoading,
    isError: isCheckSignIdDuplicateError,
    error: duplicateCheckError,
  } = useCheckSignIdDuplicate();

  const { data: groups } = useFilteredGroups({ schoolNo });

  const {
    mutate: signUp,
    isPending: isSignUpLoading,
    isSuccess: isSignUpSuccess,
    isError: isSignUpError,
    error: signUpError,
  } = useSignUp();

  const form = useForm({
    initialValues: {
      signInId: '',
      password: '',
      name: '',
      groupNo: '',
    },

    validate: {
      signInId: (value) => {
        const { error } = managerSignUpSchema.shape.signInId
          .superRefine((_, ctx) => {
            if (duplicateCheckResult?.checkedId !== value) {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message: '아이디 중복 확인을 해주세요.' });
            }

            if (duplicateCheckResult?.isDuplicated) {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message: '이미 사용 중인 아이디입니다.' });
            }
          })
          .safeParse(value);
        if (error) return showError(error);
      },
      password: (value) => {
        const { error } = managerSignUpSchema.shape.password.safeParse(value);
        if (error) return showError(error);
      },
      name: (value) => {
        const { error } = managerSignUpSchema.shape.name.safeParse(value);
        if (error) return showError(error);
      },
      groupNo: (value) => {
        if (value === '') return;
        const { error } = managerSignUpSchema.shape.parentGroupNo.safeParse(value);
        if (error) return showError(error);
      },
    },
    validateInputOnChange: true,
  });

  const isSignIdDuplicated = useMemo(() => {
    if (duplicateCheckResult === undefined) return null;
    if (form.values.signInId !== duplicateCheckResult.checkedId) return null;
    if (
      form.values.signInId !== '' &&
      duplicateCheckResult.isDuplicated &&
      duplicateCheckResult.checkedId === form.values.signInId
    ) {
      return true;
    }
    return false;
  }, [duplicateCheckResult, form.values.signInId]);

  const [displayedSignUpError, setDisplayedSignUpError] = useState<boolean>(true);

  /**
   * 아이디 중복 확인
   */
  function handleDuplicateCheck() {
    // 중복 검사 전에 아이디 유효성 검사 진행.
    // form.validateField의 에러는 에러 컴포넌트를 반환(React.ReactNode 타입)하여 아이디 중복 검사 에러와 다른 에러를 구분하기 힘듦.
    // 그래서 zod로 에러 검사 후 에러가 있으면 form.validateFiled로 화면에 에러 UI 표시.
    const { error } = managerSignUpSchema.shape.signInId.safeParse(form.values.signInId);
    if (error) {
      form.validateField('signInId');
      return;
    }
    checkSignIdDuplicate(form.values.signInId);
  }

  // 중복 체크 에러 발생
  useEffect(() => {
    if (!isCheckSignIdDuplicateError) return;
    form.setFieldError('signInId', '중복 검사 중 문제가 발생했습니다. 다시 시도해주십시오.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckSignIdDuplicateError, duplicateCheckError]); // 무한 렌더링 방지를 위해 form 제외.

  // 중복 체크 결과
  useEffect(() => {
    if (duplicateCheckResult === undefined) return;
    form.validateField('signInId');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duplicateCheckResult]); // 무한 렌더링 방지를 위해 form 제외.

  function handleSubmit(values: typeof form.values) {
    console.log('사용자 생성: ', values);
    signUp({
      signInId: values.signInId,
      password: values.password,
      name: values.name,
      schoolNo,
      parentGroupNo: values.groupNo === '' ? undefined : Number(values.groupNo),
    });
  }

  useEffect(() => {
    if (!isSignUpSuccess) return;

    notifications.show({
      title: '사용자 생성 완료',
      message: '',
      color: 'green',
      autoClose: 3000,
      position: 'top-center',
    });

    router.push(`/areas/${area}/schools/${schoolNo}/managers`);
  }, [isSignUpSuccess, router, area, schoolNo]);

  useEffect(() => {
    if (!isSignUpError) return;

    notifications.show({
      title: '사용자 생성 실패',
      message: signUpError.message,
      color: 'red',
      autoClose: 3000,
      position: 'top-center',
    });
    setDisplayedSignUpError(true);
  }, [isSignUpError, signUpError]);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} style={{ position: 'relative' }}>
      <AuthLoadingOverlay isLoading={isSignUpLoading} message="사용자 생성 중입니다." />

      {isSignUpError && displayedSignUpError && (
        <Alert
          color="red"
          mb="md"
          withCloseButton
          title="사용자 생성 실패"
          icon={<IconAlertCircleFilled size={18} />}
          onClose={() => {
            setDisplayedSignUpError(false);
          }}>
          {signUpError.message}
        </Alert>
      )}

      <Stack>
        <TextInput
          required
          label="아이디"
          placeholder="아이디를 입력해주세요."
          styles={{
            wrapper: {
              flex: 1,
            },
          }}
          inputContainer={(children) => (
            <Group align="flex-start">
              {children}
              <Button
                loading={isCheckSignIdDuplicateLoading}
                disabled={isSignIdDuplicated === false}
                onClick={handleDuplicateCheck}>
                중복 확인{isSignIdDuplicated === false ? ' 완료' : ''}
              </Button>
            </Group>
          )}
          {...form.getInputProps('signInId')}
        />

        <PasswordInput
          required
          label="비밀번호"
          placeholder="비밀번호를 입력해주세요."
          {...form.getInputProps('password')}
        />

        <TextInput required label="이름" placeholder="이름을 입력해주세요." {...form.getInputProps('name')} />

        <Select
          label="그룹"
          placeholder="그룹을 선택하세요."
          allowDeselect={true}
          data={[
            { value: '', label: '없음' },
            ...groups.groups.map((group) => ({
              value: group.groupNo.toString(),
              label: group.name,
            })),
          ]}
          {...form.getInputProps('groupNo')}
        />
      </Stack>
      <Stack>
        <Button size="md" mt="xl" type="submit" fullWidth disabled={isSignUpLoading}>
          추가
        </Button>
      </Stack>
    </form>
  );
}
