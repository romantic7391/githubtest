export interface insertRnDevicesDto {
  mac: string;
  model: string | null;
  ip: string | null;
  rip: string | null;
  splrate: number | null;
  interval: number | null;
  ver: string | null;
  tags: string | null;
  checkin: string | null;
}

export interface updateRnDevicesDto {
  mac: string;
  model: string | null;
  ip: string | null;
  rip: string | null;
  splrate: number | null;
  interval: number | null;
  ver: string | null;
  tags: string | null;
  checkin: string | null;
}

export interface softDeleteRnDevicesDto {
  mac: string;
}
