export interface LoginRequest { username: string; password: string }
export interface LoginResponse { accessToken: string; tokenType: string; username: string; name: string; role: string }
export interface AuthUser { username: string; name: string; role: string }
export interface DashboardStats { totalUsers: number; activeUsers: number; totalOrders: number; revenue: number }

// ── Institution ────────────────────────────────────────────────────────────
export type InstitutionStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
export type CommLineType = 'PUBLIC' | 'DEDICATED' | 'PUBLIC_VPN' | 'DEDICATED_VPN'
export type OtpIssueMethod = 'SMS' | 'EMAIL' | 'APP'

// 코드 옵션은 constants/codeTables.ts + hooks/useCodeTable.ts 를 통해 관리됩니다.
// DB 연동 시 useCodeTable 훅 내부만 API 호출로 교체하면 됩니다.
export const STATUS_LABELS: Record<InstitutionStatus, string> = { ACTIVE: '활성', INACTIVE: '비활성', SUSPENDED: '정지' }
export const OTP_METHOD_LABELS: Record<OtpIssueMethod, string> = { SMS: 'SMS', EMAIL: '이메일', APP: '앱' }

export type BalancingTxType = 'REMITTANCE' | 'ACCOUNT_INQUIRY'
export type BalancingMode  = 'INTEGRATED' | 'INDIVIDUAL'

export interface BalancingBank {
  bankCode: string
  bankName: string
  weight: number | ''
}

export interface BalancingItem {
  txType: BalancingTxType
  mode: BalancingMode
  banks: BalancingBank[]
}

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
  balancingItems?: BalancingItem[]
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
  balancingItems: BalancingItem[]
}

export interface Page<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number }
