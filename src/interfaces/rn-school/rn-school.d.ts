export interface insertRnSchoolDto {
  sname: string;
  scode: string;
  area: string;
  modbus: number;
  modbus_host?: string | null;
  modbus_port?: number;
  use_os?: 'Y' | 'N';
  parent_id?: number | null;
  administrationcode?: string;
}
export interface updateRnSchoolDto {
  school_no: number;
  sname: string;
  scode: string;
  area: string;
  modbus: number;
  modbus_host?: string | null;
  modbus_port: number;
  use_os?: 'Y' | 'N';
  active: 'Y' | 'N' | null;
  parent_id?: number | null;
  administrationcode?: string;
}

export interface deleteRnSchoolDto {
  school_no: number;
}
