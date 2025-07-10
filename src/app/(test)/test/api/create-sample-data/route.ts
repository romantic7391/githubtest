import { NextRequest, NextResponse } from 'next/server';
import { createDevice, createSchool } from './csd.service';
import { createRnSchool } from '@/services/areas/[area]/schools/create/create.service';
import { getClientInfo } from '@/services/log-action/log-action.service';
import { createRnDevicesRel } from '@/services/areas/[area]/schools/[schoolNo]/devices/create/craete.service';
import { findLastScholNo } from './csd.model';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const schoolCount = z.coerce
      .number()
      .nonnegative()
      .max(Number.MAX_SAFE_INTEGER)
      .default(0)
      .parse(searchParams.get('school-count'));
    const deviceCount = z.coerce
      .number()
      .nonnegative()
      .max(Number.MAX_SAFE_INTEGER)
      .default(0)
      .parse(searchParams.get('device-count'));

    const lastSchoolNo = await findLastScholNo();

    const schools = createSchool(schoolCount, { from: lastSchoolNo + 1 });
    const schoolNos = schools.map((school) => school.schoolNo);
    const devices = createDevice(deviceCount, { from: Math.min(...schoolNos), to: Math.max(...schoolNos) });

    const { userAgent, ip } = getClientInfo(request);

    for (const school of schools) {
      await createRnSchool(
        school.administrationCode!,
        { ...school },
        {
          managerNo: 1,
          schoolNo: school.schoolNo,
          ip,
          userAgent: userAgent,
        },
      );
    }

    for (const device of devices) {
      await createRnDevicesRel([device], {
        managerNo: 1,
        schoolNo: device.schoolNo,
        ip,
        userAgent: userAgent,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        schools: schools.map((school) => school.sname),
        devices: devices.map((device) => device.mac),
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error,
    });
  }
}
