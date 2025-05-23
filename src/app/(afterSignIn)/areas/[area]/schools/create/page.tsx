'use client';

import { schoolSchema } from '@/types/school';
import { Anchor, Breadcrumbs, Button, Group, NumberInput, Radio, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useParams } from 'next/navigation';

/**
 * 학교 추가 페이지
 *
 * @todo 나이스 API 학교 검색
 * @todo 학교 정보
 * - sname: 학교 이름 (나이스 검색)
 * - scode: 학교 코드 (나이스 검색 조합)
 * - area: 지역 (나이스 검색과 영문명 매핑)
 * - useOrderSheet: 작업지시서 사용 여부 (Y, N)
 * - administrationCode: 나이스 API
 */
export default function Page() {
  const { area } = useParams();

  const form = useForm({
    initialValues: {
      sname: '',
      scode: '',
      area: '',
      useOrderSheet: 'Y',
      active: 'Y',
      administrationCode: '',
      parent: '',
    },
    validate: {
      sname: (value) => {
        const { error } = schoolSchema.shape.sname.safeParse(value);
        if (error) return error.issues.map((issue) => issue.message).join('\n');
      },
      scode: (value) => {
        const { error } = schoolSchema.shape.scode.safeParse(value);
        if (error) return error.issues.map((issue) => issue.message).join('\n');
      },
      area: (value) => {
        const { error } = schoolSchema.shape.area.safeParse(value);
        if (error) return error.issues.map((issue) => issue.message).join('\n');
      },
      administrationCode: (value) => {
        const { error } = schoolSchema.shape.administrationCode.safeParse(value);
        if (error) return error.issues.map((issue) => issue.message).join('\n');
      },
    },
  });

  function handleSubmit(values: typeof form.values) {
    console.log(values);
  }

  return (
    <Stack>
      <Stack>
        <Breadcrumbs>
          <Anchor size="sm" href={`/areas/${area}/schools`}>
            학교 목록
          </Anchor>
          <Anchor size="sm" href={`/areas/${area}/schools/create`}>
            학교 추가
          </Anchor>
        </Breadcrumbs>
        <Title order={3}>학교 추가</Title>
      </Stack>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            withAsterisk
            name="sname"
            label="학교 이름"
            placeholder="ex) 사랑중학교"
            styles={{
              wrapper: {
                flex: 1,
              },
            }}
            inputContainer={(children) => (
              <Group align="flex-start">
                {children}
                <Button>학교 검색</Button>
              </Group>
            )}
            {...form.getInputProps('sname')}
          />
          <TextInput
            withAsterisk
            name="scode"
            label="학교 코드"
            placeholder="학교 검색 시 자동으로 입력됩니다."
            {...form.getInputProps('scode')}
          />
          <TextInput
            withAsterisk
            name="area"
            label="지역 영문명"
            placeholder="학교 검색 시 자동으로 입력됩니다."
            {...form.getInputProps('area')}
          />
          <NumberInput
            withAsterisk
            name="administrationCode"
            label="행정관리코드(기관)"
            placeholder="ex) 서울과학고등학교: 7010084"
            styles={{
              wrapper: { flex: 1 },
            }}
            rightSection={<></>}
            allowNegative={false}
            allowLeadingZeros={false}
            {...form.getInputProps('administrationCode')}
          />
          <Radio.Group
            label="작업지시서 사용 여부"
            name="useOrderSheet"
            defaultValue="Y"
            {...form.getInputProps('useOrderSheet')}>
            <Group>
              <Radio value="Y" label="사용" />
              <Radio value="N" label="사용 안함" />
            </Group>
          </Radio.Group>
          <Radio.Group label="활성화" name="active" defaultValue="Y" {...form.getInputProps('active')}>
            <Group>
              <Radio value="Y" label="활성화" />
              <Radio value="N" label="비활성화" />
            </Group>
          </Radio.Group>
          <NumberInput label="상위 기관" {...form.getInputProps('parent')} />

          <Group justify="flex-start">
            <Button type="submit">추가</Button>
            <Button type="reset" variant="transparent" color="gray">
              취소
            </Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}
