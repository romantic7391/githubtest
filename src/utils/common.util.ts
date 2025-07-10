// 트리 노드 타입 정의 (원본 타입 + children 배열)
export type TreeNode<T> = T & {
  children: TreeNode<T>[];
};

// 객체가 id 속성을 가지도록 제약하는 타입
export interface HasId {
  id: string | number;
}

/**
 * 오브젝트 배열을 트리 구조로 변환하는 함수
 *
 * @param data - 트리 구조로 변환할 오브젝트 배열
 * @param parentKey - 부모 참조 속성의 키 이름 (예: 'parentId')
 * @returns 트리 구조 형태의 배열
 *
 * @example
 * const data = [
 *   { id: 1, name: 'parent', parentId: null },
 *   { id: 2, name: 'child', parentId: 1 },
 * ];
 * const tree = buildTree(data, 'parentId');
 * // 결과: [{ id: 1, name: 'parent', parentId: null, children: [{ id: 2, name: 'child', parentId: 1, children: [] }] }]
 */
export function buildTree<T extends HasId>(data: T[], parentKey: keyof T): TreeNode<T>[] {
  // 빈 배열 처리
  if (!data || data.length === 0) {
    return [];
  }

  // 각 노드를 Map에 저장 (id를 키로 사용)
  const nodeMap = new Map<string | number, TreeNode<T>>();

  // 모든 노드를 Map에 추가하고 children 배열 초기화
  data.forEach((item) => {
    nodeMap.set(item.id, {
      ...item,
      children: [],
    });
  });

  // 트리 구조 생성을 위한 루트 노드 배열
  const rootNodes: TreeNode<T>[] = [];

  // 각 노드를 순회하면서 부모-자식 관계 설정
  data.forEach((item) => {
    const node = nodeMap.get(item.id);
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
