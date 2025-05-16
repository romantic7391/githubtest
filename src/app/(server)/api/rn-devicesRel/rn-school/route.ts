import { NextRequest, NextResponse } from 'next/server';
import { fetchSchoolListByNameOrArea } from '@/services/external-api/neis.services';

import { createRnSchool, updateRnSchool, deleteRnSchool } from '@/services/rn-school/rn-school.service';
import { getClientInfo } from '@/services/log-action/log-action.service';
import { updateRnSchoolDto } from '@/interfaces/rn-school/rn-school.d';

// GET (학교명, 시도명 AND/OR 검색)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  const area = searchParams.get('area');
  try {
    const schools = await fetchSchoolListByNameOrArea(name, area);
    return NextResponse.json({ success: true, message: '조회가 완료되었습니다.', schools }, { status: 200 });
  } catch (error) {
    console.error(error);
    // 시스템 내부 정보 노출 방지
    return NextResponse.json({ success: false, message: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}

// POST (학교 등록)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { administrationcode, manager_no, school_no, ...userInput } = body;
    if (!administrationcode || !manager_no) {
      return NextResponse.json({ success: false, message: '입력값이  필수입니다.' }, { status: 400 });
    }
    const { userAgent, ip } = getClientInfo(req);
    await createRnSchool(administrationcode, userInput, { manager_no, school_no, ip, user_agent: userAgent });
    return NextResponse.json({ success: true, message: '저장이 완료되었습니다.' }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ success: false, message: '서버 내부 오류가 발생했습니다.' }, { status: 400 });
  }
}

// PUT (학교 수정)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { manager_no, school_no, ...updateDto } = body;
    if (!body || !school_no || !manager_no) {
      return NextResponse.json({ success: false, message: '입력값이  필수입니다.' }, { status: 400 });
    }
    const { userAgent, ip } = getClientInfo(req);

    // updateRnSchoolDto의 모든 필드가 undefined가 아니도록 보정
    const updateParams: updateRnSchoolDto = {
      school_no,
      sname: updateDto.sname ?? '',
      scode: updateDto.scode ?? '',
      area: updateDto.area ?? '',
      modbus: updateDto.modbus ?? 0,
      modbus_host: updateDto.modbus_host ?? null,
      modbus_port: updateDto.modbus_port ?? 502,
      use_os: updateDto.use_os ?? 'N',
      active: updateDto.active ?? null,
      parent_id: updateDto.parent_id ?? null,
      administrationcode: updateDto.administrationcode ?? null,
    };

    await updateRnSchool(updateParams, { manager_no, school_no, ip, user_agent: userAgent });
    return NextResponse.json({ success: true, message: '수정이 완료되었습니다.' }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ success: false, message: '서버 내부 오류가 발생했습니다.' }, { status: 400 });
  }
}

// DELETE (학교 삭제)
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { manager_no, school_no } = body;
    if (!body || !school_no || !manager_no) {
      return NextResponse.json({ success: false, message: '입력값이  필수입니다.' }, { status: 400 });
    }
    const { userAgent, ip } = getClientInfo(req);
    await deleteRnSchool({ school_no }, { manager_no, school_no, ip, user_agent: userAgent });
    return NextResponse.json({ success: true, message: '삭제가 완료되었습니다.' }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ success: false, message: '서버 내부 오류가 발생했습니다.' }, { status: 400 });
  }
}
