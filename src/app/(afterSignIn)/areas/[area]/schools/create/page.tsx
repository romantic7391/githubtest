'use client';

import { Anchor, Breadcrumbs, Button, Group, Radio, Stack, TextInput, Title } from '@mantine/core';
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
      <Stack>
        <TextInput
          name="sname"
          label="학교 이름"
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
        />
        <TextInput name="administrationCode" label="코드" placeholder="코드" />
        <Radio.Group label="작업지시서 사용 여부" name="useOrderSheet">
          <Group>
            <Radio value="Y" label="사용" />
            <Radio value="N" label="사용 안함" />
          </Group>
        </Radio.Group>

        <Group justify="center">
          <Button type="submit">추가</Button>
          <Button type="reset" variant="transparent" color="gray">
            취소
          </Button>
        </Group>
      </Stack>
    </Stack>
  );
}
