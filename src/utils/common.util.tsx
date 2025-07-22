import { Fragment } from 'react';
import { ZodError } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// 트리 노드 타입 정의 (원본 타입 + children 배열)
export type TreeNode<T> = {
  value: string;
  label: string;
  info: T;
  children: TreeNode<T>[];
};

/**
 * 오브젝트 배열을 트리 구조로 변환하는 함수
 *
 * @param data - 트리 구조로 변환할 오브젝트 배열
 * @param key - 각 노드의 고유 식별자 키 이름 (예: 'id')
 * @param parentKey - 부모 참조 속성의 키 이름 (예: 'parentId')
 * @param labelKey - 노드 표시 텍스트의 키 이름 (예: 'name')
 * @returns 트리 구조 형태의 배열
 *
 * @example
 * const data = [
 *   { id: 1, name: '그룹1', parentId: null },
 *   { id: 2, name: '그룹2', parentId: 1 },
 *   { id: 3, name: '그룹3', parentId: 1 }
 * ];
 *
 * const tree = buildTree(data, 'id', 'parentId', 'name');
 * // 결과:
 * [{
 *   value: '1',
 *   label: '그룹1',
 *   info: { id: 1, name: '그룹1', parentId: null },
 *   children: [
 *     {
 *       value: '2',
 *       label: '그룹2',
 *       info: { id: 2, name: '그룹2', parentId: 1 },
 *       children: []
 *     },
 *     {
 *       value: '3',
 *       label: '그룹3',
 *       info: { id: 3, name: '그룹3', parentId: 1 },
 *       children: []
 *     }
 *   ]
 * }]
 */
export function buildTree<T>(data: T[], key: keyof T, parentKey: keyof T, labelKey: keyof T): TreeNode<T>[] {
  // 빈 배열 처리
  if (!data || data.length === 0) {
    return [];
  }

  // 각 노드를 Map에 저장 (id를 키로 사용)
  const nodeMap = new Map<string | number, TreeNode<T>>();

  // 모든 노드를 Map에 추가하고 children 배열 초기화
  data.forEach((item) => {
    const value = (item[key] as string | number).toString();
    const label = (item[labelKey] as string | number).toString();
    nodeMap.set(item[key] as string | number, {
      value,
      label,
      info: { ...item },
      children: [],
    });
  });

  // 트리 구조 생성을 위한 루트 노드 배열
  const rootNodes: TreeNode<T>[] = [];

  // 각 노드를 순회하면서 부모-자식 관계 설정
  data.forEach((item) => {
    const node = nodeMap.get(item[key] as string | number);
    const parentId = item[parentKey] as string | number | null | undefined;

    if (!node) return;

    // 부모가 없는 경우 (null, undefined, 빈 문자열 등) 루트 노드로 처리
    if (parentId === null || parentId === undefined || parentId === '') {
      rootNodes.push(node);
    } else {
      // 부모 노드 찾기
      const parentNode = nodeMap.get(parentId);
      if (parentNode) {
        parentNode.children.push(node);
      } else {
        // 부모를 찾을 수 없는 경우 루트 노드로 처리
        rootNodes.push(node);
      }
    }
  });

  return rootNodes;
}

/**
 * 트리 구조에서 특정 값을 가진 노드를 찾는 함수
 *
 * @param nodes - 트리 구조 배열
 * @param value - 찾을 노드의 값
 * @returns 찾은 노드 또는 null
 */
export function findNode<T>(nodes: TreeNode<T>[], value: string): TreeNode<T> | null {
  for (const node of nodes) {
    if (node.value === value) {
      return node;
    }
    const found = findNode<T>(node.children, value);
    if (found) return found;
  }
  return null;
}

/**
 * 트리 구조에서 모든 자식 노드의 값을 찾는 함수
 *
 * @param nodes - 트리 구조 배열
 * @returns 찾은 노드의 모든 자식 노드 값 배열
 */
export function findChildren<T>(nodes: TreeNode<T>[]): string[] {
  return nodes.reduce<string[]>((acc, node) => {
    return [...acc, node.value, ...findChildren<T>(node.children)];
  }, []);
}

/**
 * Input 에러 메시지 표시
 *
 * @param error - Zod 에러 객체
 * @returns 에러 메시지 배열
 */
export function showError(error: ZodError) {
  return error.issues.map((issue, index, array) => {
    return (
      <Fragment key={uuidv4()}>
        {issue.message}
        {index < array.length - 1 ? <br /> : ''}
      </Fragment>
    );
  });
}
