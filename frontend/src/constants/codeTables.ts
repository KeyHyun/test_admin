/**
 * 코드 테이블 상수 정의
 *
 * 추후 DB 연동 시 이 파일만 수정하면 됩니다.
 * API 형태: GET /api/codes?groupKey={GROUP_KEY}
 * 응답 형태: { groupKey: string, items: CodeItem[] }
 *
 * useCodeTable 훅에서 이 데이터를 반환하고 있으므로,
 * DB 연동 시 훅 내부만 API 호출로 교체하면 전체 반영됩니다.
 */

export interface CodeItem {
  value: string
  label: string
}

// GROUP_KEY → 코드 목록 매핑
// DB 테이블 구조 예시:
//   code_table (group_key VARCHAR, code_value VARCHAR, code_label VARCHAR, sort_order INT)
export const CODE_TABLES: Record<string, CodeItem[]> = {

  CONTRACT_TYPE: [
    { value: 'REPRESENTATIVE', label: '대표기관' },
    { value: 'RELAY',          label: '중계기관' },
    { value: 'RESALE',         label: '재판매기관' },
  ],

  COMM_LINE_TYPE: [
    { value: 'PUBLIC',        label: '공중망' },
    { value: 'DEDICATED',     label: '전용회선' },
    { value: 'PUBLIC_VPN',    label: '공중망 + VPN' },
    { value: 'DEDICATED_VPN', label: '전용회선 + VPN' },
  ],

  MESSAGE_TYPE: [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
  ],

  RESPONSE_TYPE: [
    { value: 'INSTITUTION', label: '기관' },
    { value: 'BANK',        label: '은행' },
    { value: 'DEFAULT',     label: '기본' },
  ],

  AML_TYPE: [
    { value: 'NONE',     label: '미사용' },
    { value: 'BASIC',    label: '기본' },
    { value: 'ENHANCED', label: '강화' },
  ],

  SERVICE_TYPE: [
    { value: 'FULL',     label: '전체' },
    { value: 'QUERY',    label: '조회' },
    { value: 'TRANSFER', label: '이체' },
    { value: 'PAYMENT',  label: '결제' },
  ],

  RESALE_TYPE: [
    { value: 'DIRECT',   label: '직접' },
    { value: 'INDIRECT', label: '간접' },
  ],

  TRUST_TYPE: [
    { value: 'FULL',    label: '전액' },
    { value: 'PARTIAL', label: '부분' },
  ],

  TRUST_SETTLEMENT_CYCLE: [
    { value: 'DAILY',   label: '일별' },
    { value: 'WEEKLY',  label: '주별' },
    { value: 'MONTHLY', label: '월별' },
  ],

  REDEBIT_TYPE: [
    { value: 'AUTO',   label: '자동' },
    { value: 'MANUAL', label: '수동' },
  ],

  REDEBIT_PROCESS_TYPE: [
    { value: 'REALTIME', label: '실시간' },
    { value: 'BATCH',    label: '배치' },
  ],
}
