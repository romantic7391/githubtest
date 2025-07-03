import { makeLogParams, logAction, getClientInfo } from '@/services/log-action/log-action.service';
import { insertLogAction } from '@/models/history-action/history-action.model';
import { NextRequest } from 'next/server';
// import { LogMeta } from '@/types/history';

// Mock dependencies
jest.mock('@/models/history-action/history-action.model');

describe('로그 액션 서비스 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('로그 파라미터를 올바르게 생성해야 함', () => {
    const params = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
      action_type: 'I' as const,
      target_table: 'test_table',
      target_id: 'test_id',
      old_values: null,
      new_values: '{"key": "value"}',
      reason: '테스트',
    };

    const result = makeLogParams(params);

    expect(result).toEqual({
      ...params,
      old_values: '',
    });
  });

  it('school_no가 null인 경우에도 로그 파라미터를 생성할 수 있어야 함', () => {
    const params = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: null,
      action_type: 'I' as const,
      target_table: 'test_table',
      target_id: 'test_id',
      old_values: null,
      new_values: '{"key": "value"}',
      reason: '테스트',
    };

    const result = makeLogParams(params);

    expect(result).toEqual({
      ...params,
      old_values: '',
    });
  });

  it('old_values가 null인 경우 빈 문자열로 변환되어야 함', () => {
    const params = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
      action_type: 'I' as const,
      target_table: 'test_table',
      target_id: 'test_id',
      old_values: null,
      new_values: '{"key": "value"}',
      reason: '테스트',
    };

    const result = makeLogParams(params);

    expect(result.old_values).toBe('');
  });

  it('manager_no가 없는 경우 에러를 발생시켜야 함', () => {
    const params = {
      ip: '127.0.0.1',
      user_agent: 'test-agent',
      school_no: 12345,
      action_type: 'I' as const,
      target_table: 'test_table',
      target_id: 'test_id',
      old_values: null,
      new_values: '{"key": "value"}',
      reason: '테스트',
    };

    expect(() => makeLogParams(params)).toThrow('Required');
  });

  it('로그 액션을 성공적으로 기록해야 함', async () => {
    const history = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
      action_type: 'I' as const,
      target_table: 'test_table',
      target_id: 'test_id',
      old_values: '',
      new_values: '{"key": "value"}',
      reason: '테스트',
    };

    await logAction(history);

    expect(insertLogAction).toHaveBeenCalledWith(history, undefined);
  });

  it('로그 액션 기록 실패 시 에러를 발생시켜야 함', async () => {
    const history = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
      action_type: 'I' as const,
      target_table: 'test_table',
      target_id: 'test_id',
      old_values: '',
      new_values: '{"key": "value"}',
      reason: '테스트',
    };

    (insertLogAction as jest.Mock).mockRejectedValueOnce(new Error('로그 기록 실패'));

    await expect(logAction(history)).rejects.toThrow('로그 기록 실패');
  });

  it('다양한 액션 타입에 대해 로그를 기록할 수 있어야 함', async () => {
    const actionTypes = ['I', 'U', 'D'] as const;
    const history = {
      ip: '127.0.0.1',
      manager_no: 1,
      user_agent: 'test-agent',
      school_no: 12345,
      target_table: 'test_table',
      target_id: 'test_id',
      old_values: '',
      new_values: '{"key": "value"}',
      reason: '테스트',
    };

    for (const actionType of actionTypes) {
      await logAction({ ...history, action_type: actionType });
      expect(insertLogAction).toHaveBeenCalledWith({ ...history, action_type: actionType }, undefined);
    }
  });

  it('getClientInfo는 요청에서 클라이언트 정보를 올바르게 추출해야 함', () => {
    // Given
    const mockRequest = {
      headers: {
        get: jest.fn((key) => {
          if (key === 'user-agent') return 'test-user-agent';
          if (key === 'x-forwarded-for') return '127.0.0.1';
          return null;
        }),
      },
    } as unknown as NextRequest;

    // When
    const result = getClientInfo(mockRequest);

    // Then
    expect(result).toEqual({
      userAgent: 'test-user-agent',
      ip: '127.0.0.1',
    });
  });

  it('getClientInfo는 헤더가 없는 경우 null을 반환해야 함', () => {
    // Given
    const mockRequest = {
      headers: {
        get: jest.fn(() => null),
      },
    } as unknown as NextRequest;

    // When
    const result = getClientInfo(mockRequest);

    // Then
    expect(result).toEqual({
      userAgent: null,
      ip: null,
    });
  });
});
