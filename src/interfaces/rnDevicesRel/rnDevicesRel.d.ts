export interface findRnDevicesRelBySchoolNoVO {
  mac: string;
  name: string | null;
  summary: string | null;
  kind: number | null;
  extra: string | null;
  sdate: string | null;
  edate: string | null;
  created: string;
  updated: string;
  deleted: string | null;
  model: string | null;
  ip: string | null;
  rip: string | null;
  splrate: number | null;
  interval: number | null;
  ver: string | null;
  tags: string | null;
  checkin: string | null;
  created: string;
}

export interface findRnDevicesRelBySchoolNoDto {
  school_no: number;
  limit: number;
  offset: number;
}

export interface insertRnDevicesRelDto {
  school_no: number;
  mac: string;
  name: string | null;
  summary: string | null;
  kind: number | null;
  extra: string | null;
  sdate: string | null;
  edate: string | null;
}

export interface updateRnDevicesRelDto {
  mac: string;
  name: string | null;
  summary: string | null;
  kind: number | null;
  extra: string | null;
  sdate: string | null;
  edate: string | null;
}

export interface softDeleteRnDevicesRelDto {
  mac: string;
}

// mac 변경용 DTO 타입 정의
export interface UpdateMacDto {
  school_no: number;
  oldMac: string;
  newMac: string;
}
