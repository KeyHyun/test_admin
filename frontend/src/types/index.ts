export interface LoginRequest { username: string; password: string }
export interface LoginResponse { accessToken: string; tokenType: string; username: string; name: string; role: string }
export interface AuthUser { username: string; name: string; role: string }
export interface DashboardStats { totalUsers: number; activeUsers: number; totalOrders: number; revenue: number }

// ── Institution ────────────────────────────────────────────────────────────
export type InstitutionStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
export type CommLineType = 'INTERNET' | 'API' | 'DEDICATED' | 'VPN'
export type OtpIssueMethod = 'SMS' | 'EMAIL' | 'APP'

export const STATUS_LABELS: Record<InstitutionStatus, string> = { ACTIVE: '활성', INACTIVE: '비활성', SUSPENDED: '정지' }
export const COMM_LINE_LABELS: Record<CommLineType, string> = { INTERNET: '인터넷', API: 'API', DEDICATED: '전용선', VPN: 'VPN' }
export const OTP_METHOD_LABELS: Record<OtpIssueMethod, string> = { SMS: 'SMS', EMAIL: '이메일', APP: '앱' }

export const CONTRACT_TYPE_OPTIONS = [
  { value: 'BASIC', label: '기본' }, { value: 'STANDARD', label: '표준' },
  { value: 'PREMIUM', label: '프리미엄' }, { value: 'ENTERPRISE', label: '기업' },
]
export const BUSINESS_TYPE_OPTIONS = [
  { value: 'BANK', label: '은행' }, { value: 'SECURITIES', label: '증권' },
  { value: 'INSURANCE', label: '보험' }, { value: 'CARD', label: '카드' },
  { value: 'FINTECH', label: '핀테크' }, { value: 'TELECOM', label: '통신' },
  { value: 'RETAIL', label: '유통' }, { value: 'OTHER', label: '기타' },
]
export const AML_TYPE_OPTIONS = [
  { value: 'NONE', label: '미사용' }, { value: 'BASIC', label: '기본' }, { value: 'ENHANCED', label: '강화' },
]
export const SERVICE_TYPE_OPTIONS = [
  { value: 'FULL', label: '전체' }, { value: 'QUERY', label: '조회' },
  { value: 'TRANSFER', label: '이체' }, { value: 'PAYMENT', label: '결제' },
]
export const RESPONSE_TYPE_OPTIONS = [
  { value: 'SYNC', label: '동기' }, { value: 'ASYNC', label: '비동기' },
]
export const MESSAGE_TYPE_OPTIONS = [
  { value: 'JSON', label: 'JSON' }, { value: 'XML', label: 'XML' },
  { value: 'FIXED', label: '고정길이' }, { value: 'CSV', label: 'CSV' },
]
export const RELAY_ACCOUNT_TYPE_OPTIONS = [
  { value: 'NORMAL', label: '일반' }, { value: 'VIRTUAL', label: '가상' },
]
export const RELAY_FEE_TYPE_OPTIONS = [
  { value: 'FIXED', label: '고정' }, { value: 'RATE', label: '요율' }, { value: 'NONE', label: '없음' },
]
export const RESALE_TYPE_OPTIONS = [
  { value: 'DIRECT', label: '직접' }, { value: 'INDIRECT', label: '간접' },
]
export const TRUST_TYPE_OPTIONS = [
  { value: 'FULL', label: '전액' }, { value: 'PARTIAL', label: '부분' },
]
export const TRUST_SETTLEMENT_CYCLE_OPTIONS = [
  { value: 'DAILY', label: '일별' }, { value: 'WEEKLY', label: '주별' }, { value: 'MONTHLY', label: '월별' },
]
export const REDEBIT_TYPE_OPTIONS = [
  { value: 'AUTO', label: '자동' }, { value: 'MANUAL', label: '수동' },
]
export const REDEBIT_PROCESS_TYPE_OPTIONS = [
  { value: 'REALTIME', label: '실시간' }, { value: 'BATCH', label: '배치' },
]

export interface ArsSource {
  id?: number
  sourceCode: string
  scenarioCode: string
  ratio: number | ''
  sortOrder?: number
}

export interface RelayTarget {
  id?: number
  bankName: string
  bankCode: string
  settlementCode: string
  conversionCode: string
  sortOrder?: number
}

export interface Institution {
  id: number
  code: string
  groupCode: string | null
  name: string
  contractTypeCode: string | null
  salesManagerName: string | null
  businessTypeCode: string | null
  status: InstitutionStatus
  statusLabel: string
  amlServiceTypeCode: string | null
  serviceTypeCode: string | null
  businessNumber: string | null
  apiKey: string | null
  commLineType: CommLineType | null
  commLineTypeLabel: string | null
  commInstitutionCode: string | null
  useBalancing: boolean
  responseTypeCode: string | null
  useAgentTxNo: boolean
  messageTypeCode: string | null
  timeoutTerm: number | null
  useAgentFile: boolean
  useDuplicateCheck: boolean
  useMasterAccount: boolean
  memo: string | null
  useValueAddedService: boolean
  useArs: boolean
  arsSources: ArsSource[]
  useOtp: boolean
  otpIssueMethod: string | null
  otpValiditySeconds: number | null
  otpDigits: number | null
  useFirmBanking: boolean
  useFbGeneral: boolean
  useFbRelay: boolean
  relayTargets: RelayTarget[]
  useFbResale: boolean
  resaleInstitutionCode: string | null
  resaleTypeCode: string | null
  resaleMarginRate: number | null
  useFbTrust: boolean
  trustTypeCode: string | null
  trustLimitAmount: number | null
  trustSettlementCycleCode: string | null
  useFbRedebit: boolean
  redebitTypeCode: string | null
  redebitDailyLimitAmount: number | null
  redebitInstitutionCode: string | null
  redebitProcessTypeCode: string | null
  createdAt: string
  updatedAt: string
}

export interface InstitutionFormData {
  code: string; groupCode: string; name: string; contractTypeCode: string
  salesManagerName: string; businessTypeCode: string; status: InstitutionStatus
  amlServiceTypeCode: string; serviceTypeCode: string; businessNumber: string
  apiKey: string; commLineType: CommLineType | ''; commInstitutionCode: string
  useBalancing: boolean; responseTypeCode: string; useAgentTxNo: boolean
  messageTypeCode: string; timeoutTerm: number | ''; useAgentFile: boolean
  useDuplicateCheck: boolean; useMasterAccount: boolean; memo: string
  useValueAddedService: boolean; useArs: boolean; arsSources: ArsSource[]
  useOtp: boolean; otpIssueMethod: string; otpValiditySeconds: number | ''; otpDigits: number | ''
  useFirmBanking: boolean
  useFbGeneral: boolean; useFbRelay: boolean; relayTargets: RelayTarget[]
  useFbResale: boolean
  resaleInstitutionCode: string; resaleTypeCode: string; resaleMarginRate: number | ''
  useFbTrust: boolean
  trustTypeCode: string; trustLimitAmount: number | ''; trustSettlementCycleCode: string
  useFbRedebit: boolean
  redebitTypeCode: string; redebitDailyLimitAmount: number | ''; redebitInstitutionCode: string; redebitProcessTypeCode: string
}

export interface Page<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number }
