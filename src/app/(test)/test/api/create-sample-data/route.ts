import { NextRequest, NextResponse } from 'next/server';
import { createDevice, createSchool } from './csd.service';
import { createRnSchool } from '@/services/areas/[area]/schools/create/create.service';
import { getClientInfo } from '@/services/log-action/log-action.service';
import { createRnDevicesRel } from '@/services/areas/[area]/schools/[schoolNo]/devices/create/craete.service';
import { findLastScholNo } from './csd.model';

export async function GET(request: NextRequest) {
  try {
    const lastSchoolNo = await findLastScholNo();

    const schools = createSchool(10, { from: lastSchoolNo + 1 });
    const schoolNos = schools.map((school) => school.schoolNo);
    const devices = createDevice(100, { from: Math.min(...schoolNos), to: Math.max(...schoolNos) });

    const { userAgent, ip } = getClientInfo(request);

    for (const school of schools) {
      await createRnSchool(
        school.administrationCode!,
        { ...school },
        {
          manager_no: 1,
          school_no: school.schoolNo,
          ip,
          user_agent: userAgent,
        },
      );
    }

    for (const device of devices) {
      await createRnDevicesRel([device], {
        manager_no: 1,
        school_no: device.schoolNo,
        ip,
        user_agent: userAgent,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        schools,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error,
    });
  }
}
