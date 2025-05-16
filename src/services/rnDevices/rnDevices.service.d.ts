export interface createRnDevicesRelServiceDto {
  school_no: number;
  mac: string;
  name: string | null;
  summary: string | null;
  kind: number | null;
  extra: string | null;
  sdate: string | null;
  edate: string | null;
  model: string | null;
  ip: string | null;
  rip: string | null;
  splrate: number | null;
  interval: number | null;
  ver: string | null;
  tags: string | null;
  checkin: string | null;
}

export interface updateRnDevicesRelServiceDto {
  school_no: number;
  mac: string;
  name: string | null;
  summary: string | null;
  kind: number | null;
  extra: string | null;
  sdate: string | null;
  edate: string | null;
  model: string | null;
  ip: string | null;
  rip: string | null;
  splrate: number | null;
  interval: number | null;
  ver: string | null;
  tags: string | null;
  checkin: string | null;
  oldMac?: string;
  newMac?: string;
}
