import { getRnSchoolsByArea } from '@/services/areas/[area]/schools/schools.service';
import { findRnSchoolsByArea } from '@/models/rn-school/rn-school.model';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { AppError } from '@/utils/error.utils';
import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import type { School } from '@/types/school';

// Next.js 모듈 모킹
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

jest.mock('@/models/rn-school/rn-school.model');
jest.mock('@/lib/mariadb/query');
jest.mock('@/services/log-action/log-action.service', () => ({
  logAction: jest.fn(),
  makeLogParams: jest.fn(),
}));

describe('Schools Service', () => {
  const mockConn = {
    release: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (beginTransaction as jest.Mock).mockResolvedValue(mockConn);
    (logAction as jest.Mock).mockResolvedValue(undefined);
    (makeLogParams as jest.Mock).mockReturnValue({});
  });

  describe('getRnSchoolsByArea', () => {
    const mockSchools: School[] = [
      {
        schoolNo: 1,
        sname: '테스트 학교 1',
        scode: 'TEST001',
        useOrderSheet: 'Y',
        active: 'Y',
        administrationCode: 'ADMIN001',
        area: '서울',
        modbus: 0,
        modbusHost: null,
        modbusPort: 502,
        created: '2024-01-01T00:00:00.000Z',
        parentNo: null,
      },
      {
        schoolNo: 2,
        sname: '테스트 학교 2',
        scode: 'TEST002',
        useOrderSheet: 'N',
        active: 'Y',
        administrationCode: 'ADMIN002',
        area: '서울',
        modbus: 0,
        modbusHost: null,
        modbusPort: 502,
        created: '2024-01-01T00:00:00.000Z',
        parentNo: null,
      },
    ];

    const meta = {
      managerNo: 1,
      schoolNo: 1,
      ip: '127.0.0.1',
      userAgent: 'test',
    };

    it('지역의 학교 목록을 성공적으로 조회해야 함', async () => {
      const area = '서울';
      const page = 1;
      const pageSize = 10;

      (findRnSchoolsByArea as jest.Mock).mockResolvedValue({
        schools: mockSchools,
        total: 2,
      });

      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await getRnSchoolsByArea(area, page, pageSize, undefined, meta);

      expect(result).toEqual({
        schools: mockSchools,
        total: 2,
        pagination: {
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1,
        },
      });

      expect(findRnSchoolsByArea).toHaveBeenCalledWith(area, page, pageSize, undefined);
      expect(commitTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();

      // logAction 호출 검증
      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'rnschool',
        targetId: `area=${area}`,
        oldValues: '',
        newValues: JSON.stringify({ schools: mockSchools, total: 2 }),
        reason: `학교 목록 조회: 지역 ${area}`,
      });
      expect(logAction).toHaveBeenCalledWith({}, mockConn);
    });

    it('전체 지역(all) 조회 시 올바른 target_id와 reason이 설정되어야 함', async () => {
      const area = 'all';
      const page = 1;
      const pageSize = 10;

      (findRnSchoolsByArea as jest.Mock).mockResolvedValue({
        schools: mockSchools,
        total: 2,
      });

      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await getRnSchoolsByArea(area, page, pageSize, undefined, meta);

      expect(result).toEqual({
        schools: mockSchools,
        total: 2,
        pagination: {
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1,
        },
      });

      // logAction 호출 검증 - all 지역일 때
      expect(makeLogParams).toHaveBeenCalledWith({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'rnschool',
        targetId: 'all',
        oldValues: '',
        newValues: JSON.stringify({ schools: mockSchools, total: 2 }),
        reason: '학교 목록 조회: 전체',
      });
    });

    it('필터가 적용된 학교 목록을 조회해야 함', async () => {
      const area = '서울';
      const page = 1;
      const pageSize = 10;
      const filters = {
        sname: '테스트',
        useOrderSheet: 'Y' as const,
        active: 'Y' as const,
      };

      (findRnSchoolsByArea as jest.Mock).mockResolvedValue({
        schools: [mockSchools[0]],
        total: 1,
      });

      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await getRnSchoolsByArea(area, page, pageSize, filters, meta);

      expect(result).toEqual({
        schools: [mockSchools[0]],
        total: 1,
        pagination: {
          page: 1,
          pageSize: 10,
          total: 1,
          totalPages: 1,
        },
      });

      expect(findRnSchoolsByArea).toHaveBeenCalledWith(area, page, pageSize, filters);
    });

    it('페이지네이션이 올바르게 계산되어야 함', async () => {
      const area = '서울';
      const page = 2;
      const pageSize = 5;

      const largeMockSchools = Array.from({ length: 25 }, (_, i) => ({
        schoolNo: i + 1,
        sname: `테스트 학교 ${i + 1}`,
        scode: `TEST${(i + 1).toString().padStart(3, '0')}`,
        useOrderSheet: 'Y' as const,
        active: 'Y' as const,
        administrationCode: `ADMIN${(i + 1).toString().padStart(3, '0')}`,
        area: '서울',
        modbus: 0,
        modbusHost: null,
        modbusPort: 502,
        created: '2024-01-01T00:00:00.000Z',
        parentNo: null,
      }));

      (findRnSchoolsByArea as jest.Mock).mockResolvedValue({
        schools: largeMockSchools.slice(5, 10),
        total: 25,
      });

      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await getRnSchoolsByArea(area, page, pageSize, undefined, meta);

      expect(result.pagination).toEqual({
        page: 2,
        pageSize: 5,
        total: 25,
        totalPages: 5,
      });
    });

    it('기본값으로 페이지와 페이지 크기가 설정되어야 함', async () => {
      const area = '서울';

      (findRnSchoolsByArea as jest.Mock).mockResolvedValue({
        schools: mockSchools,
        total: 2,
      });

      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await getRnSchoolsByArea(area, undefined, undefined, undefined, meta);

      expect(findRnSchoolsByArea).toHaveBeenCalledWith(area, 1, DEFAULT_PAGE_SIZE, undefined);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pageSize).toBe(DEFAULT_PAGE_SIZE);
    });

    it('meta가 없을 때도 정상적으로 조회되어야 함', async () => {
      const area = '서울';
      const page = 1;
      const pageSize = 10;

      (findRnSchoolsByArea as jest.Mock).mockResolvedValue({
        schools: mockSchools,
        total: 2,
      });

      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await getRnSchoolsByArea(area, page, pageSize);

      expect(result).toEqual({
        schools: mockSchools,
        total: 2,
        pagination: {
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1,
        },
      });

      expect(logAction).not.toHaveBeenCalled();
      expect(makeLogParams).not.toHaveBeenCalled();
    });

    it('학교가 없는 경우 404 에러를 발생시켜야 함', async () => {
      const area = '서울';
      const page = 1;
      const pageSize = 10;

      (findRnSchoolsByArea as jest.Mock).mockResolvedValue({
        schools: [],
        total: 0,
      });

      await expect(getRnSchoolsByArea(area, page, pageSize, undefined, meta)).rejects.toThrow(
        new AppError('해당하는 지역의 학교 목록이 존재하지 않습니다.', 404),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('findRnSchoolsByArea에서 AppError가 발생하면 그대로 전달되어야 함', async () => {
      const area = '서울';
      const page = 1;
      const pageSize = 10;

      const dbError = new AppError('데이터베이스 조회 권한이 없습니다.', 403);
      (findRnSchoolsByArea as jest.Mock).mockRejectedValue(dbError);

      await expect(getRnSchoolsByArea(area, page, pageSize, undefined, meta)).rejects.toThrow(dbError);

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('일반 에러가 발생하면 500 에러로 변환되어야 함', async () => {
      const area = '서울';
      const page = 1;
      const pageSize = 10;

      (findRnSchoolsByArea as jest.Mock).mockRejectedValue(new Error('일반 에러'));

      await expect(getRnSchoolsByArea(area, page, pageSize, undefined, meta)).rejects.toThrow(
        new AppError('학교 목록 조회 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('logAction 호출 중 에러가 발생해도 트랜잭션은 롤백되어야 함', async () => {
      const area = '서울';
      const page = 1;
      const pageSize = 10;

      (findRnSchoolsByArea as jest.Mock).mockResolvedValue({
        schools: mockSchools,
        total: 2,
      });

      (logAction as jest.Mock).mockRejectedValue(new Error('Log Action Error'));

      await expect(getRnSchoolsByArea(area, page, pageSize, undefined, meta)).rejects.toThrow(
        new AppError('학교 목록 조회 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('makeLogParams 호출 중 에러가 발생해도 트랜잭션은 롤백되어야 함', async () => {
      const area = '서울';
      const page = 1;
      const pageSize = 10;

      (findRnSchoolsByArea as jest.Mock).mockResolvedValue({
        schools: mockSchools,
        total: 2,
      });

      (makeLogParams as jest.Mock).mockImplementation(() => {
        throw new Error('Make Log Params Error');
      });

      await expect(getRnSchoolsByArea(area, page, pageSize, undefined, meta)).rejects.toThrow(
        new AppError('학교 목록 조회 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('beginTransaction 실패 시 에러를 적절히 처리해야 함', async () => {
      const area = '서울';
      const page = 1;
      const pageSize = 10;

      (beginTransaction as jest.Mock).mockRejectedValue(new Error('Connection Error'));

      await expect(getRnSchoolsByArea(area, page, pageSize, undefined, meta)).rejects.toThrow(
        new AppError('학교 목록 조회 중 오류가 발생했습니다.', 500),
      );

      expect(findRnSchoolsByArea).not.toHaveBeenCalled();
      expect(commitTransaction).not.toHaveBeenCalled();
      expect(rollbackTransaction).not.toHaveBeenCalled();
    });

    it('commitTransaction 실패 시 에러를 적절히 처리해야 함', async () => {
      const area = '서울';
      const page = 1;
      const pageSize = 10;

      (findRnSchoolsByArea as jest.Mock).mockResolvedValue({
        schools: mockSchools,
        total: 2,
      });

      (commitTransaction as jest.Mock).mockRejectedValue(new Error('Commit Error'));

      await expect(getRnSchoolsByArea(area, page, pageSize, undefined, meta)).rejects.toThrow(
        new AppError('학교 목록 조회 중 오류가 발생했습니다.', 500),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('rollbackTransaction 실패 시에도 원래 에러를 유지해야 함', async () => {
      const area = '서울';
      const page = 1;
      const pageSize = 10;

      (findRnSchoolsByArea as jest.Mock).mockResolvedValue({
        schools: [],
        total: 0,
      });

      // rollbackTransaction 에러는 무시되고 원래 에러가 유지되어야 함
      (rollbackTransaction as jest.Mock).mockRejectedValue(new Error('Rollback Error'));

      await expect(getRnSchoolsByArea(area, page, pageSize, undefined, meta)).rejects.toThrow(
        new AppError('해당하는 지역의 학교 목록이 존재하지 않습니다.', 404),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('커넥션 해제 중 에러가 발생해도 원래 에러를 유지해야 함', async () => {
      const area = '서울';
      const page = 1;
      const pageSize = 10;

      (findRnSchoolsByArea as jest.Mock).mockResolvedValue({
        schools: [],
        total: 0,
      });

      // conn.release 에러는 무시되고 원래 에러가 유지되어야 함
      mockConn.release.mockRejectedValue(new Error('Release Error'));

      await expect(getRnSchoolsByArea(area, page, pageSize, undefined, meta)).rejects.toThrow(
        new AppError('해당하는 지역의 학교 목록이 존재하지 않습니다.', 404),
      );

      expect(rollbackTransaction).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('Math.ceil(total / pageSize)가 0이 될 때 totalPages가 1이 되어야 함', async () => {
      const area = '서울';
      const page = 1;
      const pageSize = 999999;

      (findRnSchoolsByArea as jest.Mock).mockResolvedValue({
        schools: [mockSchools[0]],
        total: 1,
      });

      (commitTransaction as jest.Mock).mockResolvedValue(undefined);

      const result = await getRnSchoolsByArea(area, page, pageSize, undefined, meta);

      expect(result.pagination.totalPages).toBe(1);
    });
  });
});
