import { CODE_TABLES, CodeItem } from '../constants/codeTables'

/**
 * 코드 테이블 훅
 *
 * 현재: constants/codeTables.ts 에서 정적 데이터 반환
 *
 * DB 연동 시 아래 주석 처리된 코드로 교체하세요.
 * (react-query 사용 예시)
 *
 * import { useQuery } from '@tanstack/react-query'
 * import api from '../api/axios'
 *
 * export function useCodeTable(groupKey: string): CodeItem[] {
 *   const { data } = useQuery({
 *     queryKey: ['codes', groupKey],
 *     queryFn: () => api.get<CodeItem[]>(`/codes?groupKey=${groupKey}`).then(r => r.data),
 *     staleTime: 1000 * 60 * 10, // 10분 캐시
 *   })
 *   return data ?? []
 * }
 */
export function useCodeTable(groupKey: string): CodeItem[] {
  return CODE_TABLES[groupKey] ?? []
}
