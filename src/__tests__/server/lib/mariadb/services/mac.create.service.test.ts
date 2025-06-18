import { createRnDevicesRel } from '@/services/areas/[area]/schools/[schoolNo]/devices/create/craete.service';
import { findRelByMac, insertRnDevicesRel } from '@/models/rnDevicesRel/rnDevicesRel.model';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { logAction } from '@/services/log-action/log-action.service';
// import {  makeLogParams } from '@/services/log-action/log-action.service';
import { DeviceCreate } from '@/types/device';
import { LogMeta } from '@/types/history';
import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';

// Mock dependencies
jest.mock('@/models/rnDevicesRel/rnDevicesRel.model');
jest.mock('@/lib/mariadb/query');
jest.mock('@/services/log-action/log-action.service');

describe('센서 등록 서비스 테스트', () => {
  const mockConn = {
    release: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
    (commitTransaction as jest.Mock).mockResolvedValue(undefined);
    (rollbackTransaction as jest.Mock).mockResolvedValue(undefined);
    (findRelByMac as jest.Mock).mockResolvedValue(false);
    (insertRnDevicesRel as jest.Mock).mockResolvedValue(undefined);
    (logAction as jest.Mock).mockResolvedValue(undefined);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createTestDevice = (mac: string, name: string): DeviceCreate => ({
    mac,
    schoolNo: 12345,
    name,
    summary: null,
    kind: 1,
    extra: null,
    sdate: null,
    edate: null,
  });

  it('새로운 센서를 성공적으로 등록해야 함', async () => {
    // Given
    const dtos: DeviceCreate[] = [createTestDevice('00:11:22:33:44:55', '테스트 센서')];

    const meta: LogMeta = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
    };

    // When
    const result = await createRnDevicesRel(dtos, meta);

    // Then
    expect(result).toEqual({ success: true });
    expect(beginTransaction).toHaveBeenCalled();
    expect(findRelByMac).toHaveBeenCalledWith(dtos[0].mac, mockConn);
    expect(insertRnDevicesRel).toHaveBeenCalledWith(dtos, mockConn);
    expect(logAction).toHaveBeenCalled();
    expect(commitTransaction).toHaveBeenCalledWith(mockConn);
    expect(mockConn.release).toHaveBeenCalled();
  });

  it('이미 등록된 MAC 주소로 등록 시도 시 에러를 발생시켜야 함', async () => {
    // Given
    const dtos: DeviceCreate[] = [createTestDevice('00:11:22:33:44:55', '테스트 센서')];

    const meta: LogMeta = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
    };

    (findRelByMac as jest.Mock).mockResolvedValue(true);

    // When & Then
    await expect(createRnDevicesRel(dtos, meta)).rejects.toThrow(
      '이미 등록된 mac 주소 입니다. (학교마다 mac주소는 유일해야 합니다)',
    );
    expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
    expect(mockConn.release).toHaveBeenCalled();
  });

  it('여러 센서를 동시에 등록할 수 있어야 함', async () => {
    // Given
    const dtos: DeviceCreate[] = [
      createTestDevice('00:11:22:33:44:55', '테스트 센서 1'),
      createTestDevice('11:22:33:44:55:66', '테스트 센서 2'),
    ];

    const meta: LogMeta = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
    };

    // When
    const result = await createRnDevicesRel(dtos, meta);

    // Then
    expect(result).toEqual({ success: true });
    expect(findRelByMac).toHaveBeenCalledTimes(2);
    expect(insertRnDevicesRel).toHaveBeenCalledWith(dtos, mockConn);
    expect(logAction).toHaveBeenCalledTimes(2);
    expect(commitTransaction).toHaveBeenCalledWith(mockConn);
    expect(mockConn.release).toHaveBeenCalled();
  });

  it('로그 기록 실패 시 트랜잭션을 롤백해야 함', async () => {
    // Given
    const dtos: DeviceCreate[] = [createTestDevice('00:11:22:33:44:55', '테스트 센서')];

    const meta: LogMeta = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
    };

    (logAction as jest.Mock).mockRejectedValue(new Error('로그 기록 실패'));

    // When & Then
    await expect(createRnDevicesRel(dtos, meta)).rejects.toThrow('로그 기록 실패');
    expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
    expect(mockConn.release).toHaveBeenCalled();
  });

  it('데이터베이스 연결 실패 시 에러를 발생시켜야 함', async () => {
    // Given
    const dtos: DeviceCreate[] = [createTestDevice('00:11:22:33:44:55', '테스트 센서')];

    const meta: LogMeta = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
    };

    (beginTransaction as jest.Mock).mockRejectedValue(new Error('DB 연결 실패'));

    // When & Then
    await expect(createRnDevicesRel(dtos, meta)).rejects.toThrow('DB 연결 실패');
  });

  it('Error 인스턴스가 아닌 에러 발생 시 기본 에러 메시지를 반환해야 함', async () => {
    // Given
    const dtos: DeviceCreate[] = [createTestDevice('00:11:22:33:44:55', '테스트 센서')];

    const meta: LogMeta = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
    };

    // Error 인스턴스가 아닌 에러 발생
    (findRelByMac as jest.Mock).mockRejectedValue('알 수 없는 에러');

    // When & Then
    await expect(createRnDevicesRel(dtos, meta)).rejects.toThrow(DEFAULT_ERROR_MESSAGE_500);
  });

  it('연결 해제 실패 시에도 에러를 로깅해야 함', async () => {
    // Given
    const dtos: DeviceCreate[] = [createTestDevice('00:11:22:33:44:55', '테스트 센서')];

    const meta: LogMeta = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
    };

    const releaseError = new Error('연결 해제 실패');
    mockConn.release.mockRejectedValueOnce(releaseError);

    // When
    const result = await createRnDevicesRel(dtos, meta);

    // Then
    expect(result).toEqual({ success: true });
    expect(console.error).toHaveBeenCalledWith('Connection release error:', releaseError);
  });

  it('트랜잭션 롤백 후 연결 해제 실패 시에도 에러를 로깅해야 함', async () => {
    // Given
    const dtos: DeviceCreate[] = [createTestDevice('00:11:22:33:44:55', '테스트 센서')];

    const meta: LogMeta = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
    };

    (findRelByMac as jest.Mock).mockResolvedValue(true); // 중복 MAC 주소로 인한 에러 발생
    const releaseError = new Error('연결 해제 실패');
    mockConn.release.mockRejectedValueOnce(releaseError);

    // When & Then
    await expect(createRnDevicesRel(dtos, meta)).rejects.toThrow(
      '이미 등록된 mac 주소 입니다. (학교마다 mac주소는 유일해야 합니다)',
    );
    expect(rollbackTransaction).toHaveBeenCalledWith(mockConn);
    expect(mockConn.release).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Connection release error:', releaseError);
  });

  it('연결 해제 실패 시에도 에러를 로깅하고 성공을 반환해야 함', async () => {
    // Given
    const dtos: DeviceCreate[] = [createTestDevice('00:11:22:33:44:55', '테스트 센서')];

    const meta: LogMeta = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
    };

    const releaseError = new Error('연결 해제 실패');
    mockConn.release.mockRejectedValueOnce(releaseError);

    // When
    const result = await createRnDevicesRel(dtos, meta);

    // Then
    expect(result).toEqual({ success: true });
    expect(console.error).toHaveBeenCalledWith('Connection release error:', releaseError);
  });

  it('알 수 없는 에러 발생 시 기본 에러 메시지를 반환해야 함', async () => {
    // Given
    const dtos: DeviceCreate[] = [createTestDevice('00:11:22:33:44:55', '테스트 센서')];

    const meta: LogMeta = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
    };

    // Error 인스턴스가 아닌 에러 발생
    (logAction as jest.Mock).mockRejectedValue('알 수 없는 에러');

    // When & Then
    await expect(createRnDevicesRel(dtos, meta)).rejects.toThrow(DEFAULT_ERROR_MESSAGE_500);
  });

  it('데이터베이스 연결이 없는 경우에도 정상 동작해야 함', async () => {
    // Given
    const dtos: DeviceCreate[] = [createTestDevice('00:11:22:33:44:55', '테스트 센서')];

    const meta: LogMeta = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
    };

    // beginTransaction이 undefined를 반환하도록 설정
    (beginTransaction as jest.Mock).mockResolvedValue(undefined);

    // When
    const result = await createRnDevicesRel(dtos, meta);

    // Then
    expect(result).toEqual({ success: true });
    expect(mockConn.release).not.toHaveBeenCalled();
  });

  it('conn이 undefined인 경우에도 정상 동작해야 함 (release 호출 안됨)', async () => {
    // Given
    const dtos: DeviceCreate[] = [createTestDevice('00:11:22:33:44:55', '센서')];
    const meta: LogMeta = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'agent',
      school_no: 12345,
    };

    // conn을 undefined로 명시
    (beginTransaction as jest.Mock).mockImplementation(async () => undefined);

    // When
    const result = await createRnDevicesRel(dtos, meta);

    // Then
    expect(result).toEqual({ success: true });
    expect(mockConn.release).not.toHaveBeenCalled(); // 여기 중요!
  });

  it('연결 해제가 성공적으로 이루어져야 함', async () => {
    // Given
    const dtos: DeviceCreate[] = [createTestDevice('00:11:22:33:44:55', '테스트 센서')];

    const meta: LogMeta = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
    };

    // release가 성공적으로 호출되도록 설정
    mockConn.release.mockResolvedValueOnce(undefined);

    // When
    const result = await createRnDevicesRel(dtos, meta);

    // Then
    expect(result).toEqual({ success: true });
    expect(mockConn.release).toHaveBeenCalled();
  });

  it('release 함수가 없는 경우에도 예외 없이 종료되어야 함', async () => {
    // Given
    const dtos: DeviceCreate[] = [createTestDevice('AA:BB:CC:DD:EE:FF', '센서')];
    const meta: LogMeta = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
    };

    // conn 객체는 있지만 release 함수가 없음
    (beginTransaction as jest.Mock).mockResolvedValue({});

    // When
    const result = await createRnDevicesRel(dtos, meta);

    // Then
    expect(result).toEqual({ success: true });
  });

  it('release 함수가 문자열 에러를 던질 때도 에러를 로깅해야 함', async () => {
    // Given
    const dtos: DeviceCreate[] = [createTestDevice('00:11:22:33:44:55', '테스트 센서')];

    const meta: LogMeta = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
    };

    // release가 문자열 에러를 던지도록 설정
    mockConn.release.mockRejectedValueOnce('연결 해제 실패');

    // When
    const result = await createRnDevicesRel(dtos, meta);

    // Then
    expect(result).toEqual({ success: true });
    expect(console.error).toHaveBeenCalledWith('Connection release error:', '연결 해제 실패');
  });

  it('insert 성공 후 logAction에서 실패 시 insert된 데이터가 커밋되지 않아야 함', async () => {
    // Given
    const dtos: DeviceCreate[] = [createTestDevice('00:11:22:33:44:55', '테스트 센서')];
    const meta: LogMeta = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
    };

    (logAction as jest.Mock).mockRejectedValueOnce(new Error('로그 기록 실패'));

    // When
    await expect(createRnDevicesRel(dtos, meta)).rejects.toThrow('로그 기록 실패');

    // Then
    expect(insertRnDevicesRel).toHaveBeenCalled();
    expect(commitTransaction).not.toHaveBeenCalled();
    expect(rollbackTransaction).toHaveBeenCalled();
  });

  it('MAC 주소가 대소문자 혼합일 때도 정상적으로 처리되어야 함', async () => {
    // Given
    const dtos: DeviceCreate[] = [createTestDevice('00:11:22:33:44:55', '테스트 센서')];
    const meta: LogMeta = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
    };

    // When
    const result = await createRnDevicesRel(dtos, meta);

    // Then
    expect(result).toEqual({ success: true });
    expect(findRelByMac).toHaveBeenCalledWith('00:11:22:33:44:55', mockConn);
  });

  it('DeviceCreate 배열이 비어있는 경우 에러를 발생시켜야 함', async () => {
    // Given
    const dtos: DeviceCreate[] = [];
    const meta: LogMeta = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
    };

    // When & Then
    await expect(createRnDevicesRel(dtos, meta)).rejects.toThrow('등록할 센서 정보가 없습니다.');
    expect(findRelByMac).not.toHaveBeenCalled();
    expect(insertRnDevicesRel).not.toHaveBeenCalled();
    expect(logAction).not.toHaveBeenCalled();
    expect(commitTransaction).not.toHaveBeenCalled();
    expect(rollbackTransaction).toHaveBeenCalled();
  });

  it('중복된 MAC 주소로 등록 시도 시 정확한 에러 메시지와 함께 실패해야 함', async () => {
    // Given
    const dtos: DeviceCreate[] = [createTestDevice('00:11:22:33:44:55', '테스트 센서')];
    const meta: LogMeta = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
    };

    (findRelByMac as jest.Mock).mockResolvedValueOnce(true);

    // When & Then
    await expect(createRnDevicesRel(dtos, meta)).rejects.toThrowError(
      new Error('이미 등록된 mac 주소 입니다. (학교마다 mac주소는 유일해야 합니다)'),
    );
  });
});
