/**
 * 총 페이지 수를 계산합니다.
 * @param {number} pageSize 페이지당 아이템 수
 * @param {number} total 총 아이템 수
 * @returns {number} 총 페이지 수
 */
export function calculateTotalPage(pageSize: number, total: number): number {
  if (total <= 0 || pageSize <= 0) {
    return 0;
  }
  return Math.ceil(total / pageSize);
}
