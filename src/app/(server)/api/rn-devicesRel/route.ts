import { NextRequest, NextResponse } from 'next/server';
import {
  createRnDevicesRel,
  syncRnDevicesRel,
  getRnDevicesRelBySchoolNo,
} from '@/services/rnDevices/rnDevices.service';
import { deviceSchema, deviceQuerySchema } from '@/schemas/rnDevices';
import { z } from 'zod';
import { RequestMeta } from '@/interfaces/log-action/log-action.d';

// zod 스키마에서 타입 추출
// DeviceQuery 타입: { school_no: number; limit?: number; offset?: number; }
type DeviceQuery = z.infer<typeof deviceQuerySchema>;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // string | null로 파라미터 추출
    const params = {
      school_no: searchParams.get('school_no'),
      manager_no: searchParams.get('manager_no'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    };
    // zod로 검증 및 타입 변환
    const parseResult = deviceQuerySchema.safeParse(params);
    if (!parseResult.success) {
      // 검증 실패 시 상세 정보는 로그로만 남기고, 사용자에겐 일반 메시지
      console.error('[GET /air-api/rn-devicesRel] 입력값 검증 실패:', parseResult.error);
      return NextResponse.json({ success: false, message: '요청 파라미터가 올바르지 않습니다.' }, { status: 400 });
    }
    // 타입 안전하게 파라미터 사용
    const { school_no, manager_no, limit, offset }: DeviceQuery = parseResult.data;
    const meta: RequestMeta = {
      manager_no,
      school_no,
      req,
    };
    const result = await getRnDevicesRelBySchoolNo(
      {
        school_no,
        limit: limit ?? 10,
        offset: offset ?? 0,
      },
      meta,
    );
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    // 내부 에러는 상세 로그, 사용자에겐 일반 메시지
    console.error('[GET /air-api/rn-devicesRel] 서버 에러:', error);
    return NextResponse.json({ success: false, message: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { manager_no, school_no, devices } = body;
    if (typeof manager_no !== 'number' || typeof school_no !== 'number' || !Array.isArray(devices)) {
      return NextResponse.json(
        { success: false, message: 'manager_no, school_no, devices는 필수입니다.' },
        { status: 400 },
      );
    }
    console.log('[POST] body:', JSON.stringify(body, null, 2));
    const devicesSchema = z.array(deviceSchema);
    const parseResult = devicesSchema.safeParse(devices);

    if (!parseResult.success) {
      console.error('[POST] 입력값 검증 실패:', parseResult.error);
      return NextResponse.json({ success: false, message: '입력값이 올바르지 않습니다.' }, { status: 400 });
    }

    const meta: RequestMeta = {
      manager_no,
      school_no,
      req,
    };

    console.log('[POST] createRnDevicesRel 호출');
    await createRnDevicesRel(parseResult.data, meta);
    console.log('[POST] createRnDevicesRel 성공');

    return NextResponse.json({ success: true, message: '저장 되었습니다' }, { status: 200 });
  } catch (error) {
    console.error('[POST] 에러:', error);
    let message = '서버 내부 오류입니다.';
    let status = 500;

    if (error instanceof Error) {
      if (error.message === '이미 등록된 mac 주소 입니다. (학교마다 mac주소는 유일해야 합니다)') {
        message = error.message;
        status = 400; // 중복 에러는 409 Conflict
      }
      // 필요시 다른 비즈니스 에러 추가
    }

    return NextResponse.json({ success: false, message }, { status });
  }
}

// 학교별 센서 동기화
export async function PUT(req: NextRequest) {
  console.log('[PUT /air-api/rn-devicesRel] 진입');
  try {
    const body = await req.json();
    console.log('[PUT] body:', JSON.stringify(body, null, 2));
    const { manager_no, school_no, devices } = body;
    if (typeof manager_no !== 'number' || typeof school_no !== 'number' || !Array.isArray(devices)) {
      return NextResponse.json(
        { success: false, message: 'manager_no, school_no, devices는 필수입니다.' },
        { status: 400 },
      );
    }
    const devicesSchema = z.array(deviceSchema);
    const parseResult = devicesSchema.safeParse(devices);

    if (!parseResult.success) {
      console.error('[PUT] 입력값 검증 실패:', parseResult.error);
      return NextResponse.json({ success: false, message: '입력값이 올바르지 않습니다.' }, { status: 400 });
    }

    // school_no별로 그룹핑 후 각각 동기화
    const grouped = parseResult.data.reduce(
      (acc, cur) => {
        if (!acc[cur.school_no]) acc[cur.school_no] = [];
        acc[cur.school_no].push(cur);
        return acc;
      },
      {} as Record<number, typeof parseResult.data>,
    );

    for (const [school_no, devices] of Object.entries(grouped)) {
      console.log(`[PUT] syncRnDevicesRel 호출: school_no=${school_no}, devices=`, JSON.stringify(devices, null, 2));
      await syncRnDevicesRel(Number(school_no), devices, req, manager_no, Number(school_no));
      // TODO: syncRnDevicesRel도 meta로 통일하려면 서비스 함수 시그니처 수정 필요
      console.log(`[PUT] syncRnDevicesRel 성공: school_no=${school_no}`);
    }

    return NextResponse.json({ success: true, message: '저장 되었습니다' }, { status: 200 });
  } catch (error) {
    console.error('[PUT] 에러:', error);
    let message = '서버  오류입니다.';
    let status = 500;
    if (
      error instanceof Error &&
      error.message === '이미 등록된 mac 주소 입니다. (학교마다 mac주소는 유일해야 합니다)'
    ) {
      message = error.message;
      status = 400;
    }
    return NextResponse.json({ success: false, message }, { status });
  }
}
