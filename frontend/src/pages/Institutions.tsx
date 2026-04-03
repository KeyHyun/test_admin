import React, { useEffect, useState } from 'react'
import {
  Plus, Search, Building2, ChevronLeft, ChevronRight, ChevronDown,
  Pencil, Trash2, X, AlertCircle, Check, Trash, RefreshCw,
} from 'lucide-react'
import clsx from 'clsx'
import api from '../api/axios'
import {
  Institution, InstitutionFormData, InstitutionStatus, CommLineType,
  ArsSource, RelayTarget, STATUS_LABELS, OTP_METHOD_LABELS, Page,
  BalancingItem, BalancingTxType, BalancingBank,
} from '../types'
import { useCodeTable } from '../hooks/useCodeTable'

// ── 초기 폼 ────────────────────────────────────────────────────────────────
const EMPTY_FORM: InstitutionFormData = {
  code: '', groupCode: '', name: '', contractTypeCode: '', salesManagerName: '',
  businessTypeCode: '', status: 'ACTIVE', amlServiceTypeCode: '', serviceTypeCode: '',
  businessNumber: '', apiKey: '', commLineType: '', commInstitutionCode: '',
  useBalancing: false, responseTypeCode: '', useAgentTxNo: false, messageTypeCode: '',
  timeoutTerm: 30000, useAgentFile: false, useDuplicateCheck: false, useMasterAccount: false,
  memo: '', useValueAddedService: false, useArs: false, arsSources: [],
  useOtp: false, otpIssueMethod: '', otpValiditySeconds: 180, otpDigits: 6,
  useFirmBanking: false,
  useFbGeneral: false, useFbRelay: false, relayTargets: [],
  useFbResale: false,
  resaleInstitutionCode: '', resaleTypeCode: '', resaleMarginRate: '',
  useFbTrust: false,
  trustTypeCode: '', trustLimitAmount: '', trustSettlementCycleCode: '',
  useFbRedebit: false,
  redebitTypeCode: '', redebitDailyLimitAmount: '', redebitInstitutionCode: '', redebitProcessTypeCode: '',
  balancingItems: [],
}

const STEPS = ['기본 정보', '메모', '서비스 분류'] as const
type StepIndex = 0 | 1 | 2

// ── 공통 UI ────────────────────────────────────────────────────────────────
function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="form-label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function Sel({ value, onChange, options, placeholder, disabled }: {
  value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]; placeholder?: string; disabled?: boolean
}) {
  return (
    <select className="form-input" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function Toggle({ value, onChange, label, desc }: {
  value: boolean; onChange: (v: boolean) => void; label?: string; desc?: string
}) {
  return (
    <div className="flex items-center justify-between">
      {(label || desc) && (
        <div>
          {label && <p className="text-sm font-medium text-gray-700">{label}</p>}
          {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
        </div>
      )}
      <button type="button" onClick={() => onChange(!value)}
        className={clsx('relative w-10 h-6 rounded-full transition-colors shrink-0', value ? 'bg-primary' : 'bg-gray-200')}>
        <span className={clsx('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
          value ? 'left-[18px]' : 'left-0.5')} />
      </button>
    </div>
  )
}

function SectionBox({ title, desc, enabled, onToggle, onEdit, configured = true, children }: {
  title: string; desc?: string; enabled: boolean; onToggle: (v: boolean) => void
  onEdit?: () => void; configured?: boolean; children?: React.ReactNode
}) {
  const warn = enabled && !configured
  return (
    <div className={clsx('rounded-xl border-2 transition-colors overflow-hidden',
      warn ? 'border-orange-200' : enabled ? 'border-primary/30' : 'border-gray-100')}>
      <div className={clsx('flex items-center justify-between px-5 py-4',
        warn ? 'bg-orange-50' : enabled ? 'bg-primary/5' : 'bg-gray-50')}>
        <div>
          <div className="flex items-center gap-2">
            <p className={clsx('font-semibold', warn ? 'text-orange-600' : enabled ? 'text-primary' : 'text-gray-700')}>{title}</p>
            {warn && (
              <span className="text-xs bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full font-medium">미구성</span>
            )}
          </div>
          {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
        </div>
        <div className="flex items-center gap-2">
          {enabled && onEdit && (
            <button type="button" onClick={onEdit}
              className={clsx('text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
                warn ? 'text-orange-600 border-orange-200 hover:bg-orange-100' : 'text-primary border-primary/30 hover:bg-primary/10')}>
              설정 편집
            </button>
          )}
          <Toggle value={enabled} onChange={onToggle} />
        </div>
      </div>
      {enabled && !onEdit && children && (
        <div className="px-5 py-4 border-t border-gray-100 space-y-4">{children}</div>
      )}
    </div>
  )
}

// ── 그룹 기관코드 조회 모달 ───────────────────────────────────────────────
function GroupCodePickerModal({ onSelect, onClose }: {
  onSelect: (code: string) => void
  onClose: () => void
}) {
  const [codes, setCodes] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [newCode, setNewCode] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/institutions/group-codes')
      .then(r => setCodes(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = codes.filter(c => c.toLowerCase().includes(search.toLowerCase()))
  const newCodeValid = /^[A-Z0-9]{2,20}$/.test(newCode)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col" style={{ maxHeight: '70vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-base font-semibold text-gray-900">그룹 기관코드 조회</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <input className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="코드 검색..." />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {loading ? (
            <p className="text-center text-sm text-gray-400 py-4">불러오는 중...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-4">조회된 코드가 없습니다.</p>
          ) : (
            <ul className="space-y-1">
              {filtered.map(code => (
                <li key={code} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50">
                  <span className="font-mono text-sm text-gray-800">{code}</span>
                  <button type="button" onClick={() => { onSelect(code); onClose() }}
                    className="text-xs text-primary font-medium px-3 py-1 rounded-lg border border-primary/30 hover:bg-primary/10 transition-colors">
                    선택
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl shrink-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">신규 등록</p>
          <div className="flex gap-2">
            <input className="form-input flex-1 font-mono" value={newCode}
              onChange={e => setNewCode(e.target.value.toUpperCase())} placeholder="새 코드 입력 (2~20자)" />
            <button type="button" disabled={!newCodeValid}
              onClick={() => { onSelect(newCode); onClose() }}
              className="btn-primary whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed">
              등록 후 선택
            </button>
          </div>
          {newCode && !newCodeValid && (
            <p className="text-xs text-red-400 mt-1">영문 대문자/숫자 2~20자로 입력하세요.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 스텝 진행 표시 ──────────────────────────────────────────────────────────
function Stepper({ current, completed }: { current: StepIndex; completed: Set<number> }) {
  return (
    <div className="flex items-center px-6 py-4 border-b border-gray-100">
      {STEPS.map((label, i) => {
        const done = completed.has(i)
        const active = i === current
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                done ? 'bg-primary border-primary text-white'
                  : active ? 'border-primary text-primary bg-white'
                  : 'border-gray-200 text-gray-300 bg-white'
              )}>
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={clsx('text-xs font-medium whitespace-nowrap hidden sm:block',
                active ? 'text-primary' : done ? 'text-gray-600' : 'text-gray-300')}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={clsx('h-0.5 flex-1 mx-2 mb-4 transition-colors',
                completed.has(i) ? 'bg-primary' : 'bg-gray-200')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── 밸런싱 통합설정 모달 ──────────────────────────────────────────────────────
const BALANCING_TX_LABELS: Record<BalancingTxType, string> = {
  REMITTANCE:       '송금',
  ACCOUNT_INQUIRY:  '예금주 조회',
}

function IntegratedSettingsModal({ txType, onClose }: { txType: BalancingTxType; onClose: () => void }) {
  // TODO: DB 연동 시 GET /api/balancing/integrated?txType={txType} 로 교체
  const mockData = [
    { bankCode: 'KB001', bankName: '국민은행',   weight: 30 },
    { bankCode: 'NH002', bankName: '농협은행',   weight: 40 },
    { bankCode: 'SH003', bankName: '신한은행',   weight: 30 },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-900">{BALANCING_TX_LABELS[txType]} 통합 밸런싱 설정</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left py-2 font-medium">은행코드</th>
                <th className="text-left py-2 font-medium">은행명</th>
                <th className="text-right py-2 font-medium">Weight</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map(row => (
                <tr key={row.bankCode} className="border-b border-gray-50">
                  <td className="py-2 font-mono text-xs text-gray-500">{row.bankCode}</td>
                  <td className="py-2 text-gray-700">{row.bankName}</td>
                  <td className="py-2 text-right font-medium text-gray-700">{row.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-3">* 통합 설정은 별도 관리 화면에서 수정할 수 있습니다.</p>
        </div>
      </div>
    </div>
  )
}

// ── 밸런싱 설정 ───────────────────────────────────────────────────────────────
const BALANCING_TX_TYPES: { value: BalancingTxType; label: string }[] = [
  { value: 'REMITTANCE',      label: '송금' },
  { value: 'ACCOUNT_INQUIRY', label: '예금주 조회' },
]

function BalancingConfig({ form, set }: { form: InstitutionFormData; set: SetFn }) {
  const [integratedModal, setIntegratedModal] = useState<BalancingTxType | null>(null)
  const items = form.balancingItems

  const getItem = (txType: BalancingTxType) => items.find(i => i.txType === txType)

  const toggleTxType = (txType: BalancingTxType, checked: boolean) => {
    if (checked) {
      set('balancingItems', [...items, { txType, mode: 'INTEGRATED', banks: [] }])
    } else {
      set('balancingItems', items.filter(i => i.txType !== txType))
    }
  }

  const setMode = (txType: BalancingTxType, mode: BalancingItem['mode']) => {
    set('balancingItems', items.map(i => i.txType === txType ? { ...i, mode, banks: [] } : i))
  }

  const addBank = (txType: BalancingTxType) => {
    set('balancingItems', items.map(i => i.txType === txType
      ? { ...i, banks: [...i.banks, { bankCode: '', bankName: '', weight: '' }] } : i))
  }

  const updateBank = (txType: BalancingTxType, idx: number, field: keyof BalancingBank, value: BalancingBank[keyof BalancingBank]) => {
    set('balancingItems', items.map(i => i.txType === txType
      ? { ...i, banks: i.banks.map((b, bi) => bi === idx ? { ...b, [field]: value } : b) } : i))
  }

  const removeBank = (txType: BalancingTxType, idx: number) => {
    set('balancingItems', items.map(i => i.txType === txType
      ? { ...i, banks: i.banks.filter((_, bi) => bi !== idx) } : i))
  }

  return (
    <div className="pl-4 border-l-2 border-primary/30 space-y-4 pt-1">
      {BALANCING_TX_TYPES.map(({ value, label }) => {
        const item = getItem(value)
        return (
          <div key={value} className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={!!item}
                onChange={e => toggleTxType(value, e.target.checked)}
                className="w-4 h-4 accent-primary rounded" />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </label>

            {item && (
              <div className="pl-6 space-y-3">
                {/* 통합 / 개별 선택 */}
                <div className="flex items-center gap-5">
                  {(['INTEGRATED', 'INDIVIDUAL'] as const).map(mode => (
                    <label key={mode} className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input type="radio" name={`balancing-mode-${value}`}
                        checked={item.mode === mode}
                        onChange={() => setMode(value, mode)}
                        className="accent-primary" />
                      <span className="text-sm text-gray-700">{mode === 'INTEGRATED' ? '통합' : '개별'}</span>
                    </label>
                  ))}
                  {item.mode === 'INTEGRATED' && (
                    <button type="button"
                      onClick={() => setIntegratedModal(value)}
                      className="text-xs text-primary font-medium underline underline-offset-2 hover:text-primary/80">
                      통합설정 보기
                    </button>
                  )}
                </div>

                {/* 개별 은행/weight 입력 */}
                {item.mode === 'INDIVIDUAL' && (
                  <div className="space-y-2">
                    {item.banks.length > 0 && (
                      <div className="grid grid-cols-[6rem_1fr_5rem_2rem] gap-2 px-1">
                        <span className="text-xs text-gray-400 font-medium">은행코드</span>
                        <span className="text-xs text-gray-400 font-medium">은행명</span>
                        <span className="text-xs text-gray-400 font-medium">Weight</span>
                        <span />
                      </div>
                    )}
                    {item.banks.map((bank, idx) => (
                      <div key={idx} className="grid grid-cols-[6rem_1fr_5rem_2rem] gap-2 items-center">
                        <input className="form-input text-xs" value={bank.bankCode}
                          onChange={e => updateBank(value, idx, 'bankCode', e.target.value)}
                          placeholder="KB001" />
                        <input className="form-input text-xs" value={bank.bankName}
                          onChange={e => updateBank(value, idx, 'bankName', e.target.value)}
                          placeholder="은행명" />
                        <input type="number" className="form-input text-xs" value={bank.weight}
                          onChange={e => updateBank(value, idx, 'weight', e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="0" min={0} max={100} />
                        <button type="button" onClick={() => removeBank(value, idx)}
                          className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addBank(value)}
                      className="flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                      <Plus className="w-3.5 h-3.5" /> 은행 추가
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {integratedModal && (
        <IntegratedSettingsModal txType={integratedModal} onClose={() => setIntegratedModal(null)} />
      )}
    </div>
  )
}

// ── Step 1: 기본 + 통신 정보 ────────────────────────────────────────────────
function Step1({ form, set, isEdit }: { form: InstitutionFormData; set: SetFn; isEdit: boolean }) {
  const [showGroupPicker, setShowGroupPicker] = useState(false)
  const contractTypes  = useCodeTable('CONTRACT_TYPE')
  const commLineTypes  = useCodeTable('COMM_LINE_TYPE')
  const messageTypes   = useCodeTable('MESSAGE_TYPE')
  const responseTypes  = useCodeTable('RESPONSE_TYPE')
  const amlTypes       = useCodeTable('AML_TYPE')
  const serviceTypes   = useCodeTable('SERVICE_TYPE')

  // 공중망 계열 → API KEY 필요, VPN 계열 → 통신기관코드 필요
  const showApiKey   = form.commLineType === 'PUBLIC' || form.commLineType === 'PUBLIC_VPN'
  const showCommCode = form.commLineType === 'DEDICATED' || form.commLineType === 'PUBLIC_VPN' || form.commLineType === 'DEDICATED_VPN'
  return (
    <div className="space-y-5">
      {/* 기본 정보 */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">기본 정보</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="기관코드" required hint="영문 대문자/숫자 2~20자">
            <input className="form-input" value={form.code}
              onChange={e => set('code', e.target.value.toUpperCase())}
              placeholder="KBKR01" required disabled={isEdit} />
          </Field>
          <Field label="그룹 기관코드">
            <div className="relative">
              <input className="form-input pr-14" value={form.groupCode}
                onChange={e => set('groupCode', e.target.value.toUpperCase())} placeholder="KBGRP" />
              <button type="button" onClick={() => setShowGroupPicker(true)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-primary font-semibold px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors">
                조회
              </button>
            </div>
            {showGroupPicker && (
              <GroupCodePickerModal
                onSelect={code => set('groupCode', code)}
                onClose={() => setShowGroupPicker(false)}
              />
            )}
          </Field>
          <Field label="기관명" required>
            <input className="form-input" value={form.name}
              onChange={e => set('name', e.target.value)} placeholder="기관명 입력" required />
          </Field>
          <Field label="계약 유형코드">
            <Sel value={form.contractTypeCode} onChange={v => set('contractTypeCode', v)}
              options={contractTypes} placeholder="선택" />
          </Field>
          <Field label="영업 담당자명">
            <input className="form-input" value={form.salesManagerName}
              onChange={e => set('salesManagerName', e.target.value)} placeholder="담당자명" />
          </Field>
          <Field label="업종 구분코드">
            <input className="form-input" value={form.businessTypeCode}
              onChange={e => set('businessTypeCode', e.target.value)} placeholder="업종 구분코드 입력" />
          </Field>
          <Field label="기관 상태코드" required>
            <Sel value={form.status} onChange={v => set('status', v as InstitutionStatus)}
              options={Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
          </Field>
          <Field label="AML 서비스 유형코드">
            <Sel value={form.amlServiceTypeCode} onChange={v => set('amlServiceTypeCode', v)}
              options={amlTypes} placeholder="선택" />
          </Field>
          <Field label="서비스 유형코드">
            <Sel value={form.serviceTypeCode} onChange={v => set('serviceTypeCode', v)}
              options={serviceTypes} placeholder="선택" />
          </Field>
          <Field label="사업자 번호" hint="123-45-67890">
            <input className="form-input" value={form.businessNumber}
              onChange={e => set('businessNumber', e.target.value)} placeholder="123-45-67890" />
          </Field>
        </div>
      </div>

      {/* 통신 정보 */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">통신 정보</h3>
        <div className="space-y-4">
          <Field label="통신 회선 종류">
            <Sel value={form.commLineType ?? ''} onChange={v => set('commLineType', v as CommLineType | '')}
              options={commLineTypes} placeholder="선택" />
          </Field>
          {showApiKey && (
            <div className="pl-4 border-l-2 border-primary/30">
              <Field label="API KEY" hint="인터넷/API/VPN 방식 통신 시 사용">
                <div className="flex gap-2">
                  <input className="form-input font-mono text-xs flex-1" value={form.apiKey}
                    onChange={e => set('apiKey', e.target.value)} placeholder="API Key 입력" />
                  <button type="button"
                    onClick={() => set('apiKey', Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2, '0')).join(''))}
                    className="shrink-0 flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                    <RefreshCw size={12} />생성
                  </button>
                </div>
              </Field>
            </div>
          )}
          {showCommCode && (
            <div className="pl-4 border-l-2 border-primary/30">
              <Field label="통신 기관코드" hint="전용선/VPN 연결 시 상대 기관 코드">
                <input className="form-input" value={form.commInstitutionCode}
                  onChange={e => set('commInstitutionCode', e.target.value.toUpperCase())} placeholder="COMM001" />
              </Field>
            </div>
          )}
        </div>
      </div>

      {/* 추가 옵션 */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">추가 옵션</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="전문 유형코드">
            <Sel value={form.messageTypeCode} onChange={v => set('messageTypeCode', v)}
              options={messageTypes} placeholder="선택" />
          </Field>
          <Field label="타임아웃 TERM (ms)">
            <input type="number" className="form-input" value={form.timeoutTerm}
              onChange={e => set('timeoutTerm', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="30000" min={0} />
          </Field>
          <Field label="응답 구분코드">
            <Sel value={form.responseTypeCode} onChange={v => set('responseTypeCode', v)}
              options={responseTypes} placeholder="선택" />
          </Field>
        </div>
        <div className="space-y-3">
          <div className="py-3 border-b border-gray-50 space-y-3">
            <Toggle value={form.useBalancing} onChange={v => set('useBalancing', v)}
              label="밸런싱 사용 여부" desc="트래픽 로드 밸런싱 사용" />
            {form.useBalancing && <BalancingConfig form={form} set={set} />}
          </div>
          {[
            { key: 'useAgentFile', label: '대행파일 처리여부', desc: '배치 대행파일 처리 기능' },
            { key: 'useAgentTxNo', label: '거래번호 대행 채번 여부', desc: '거래번호 자동 채번' },
            { key: 'useDuplicateCheck', label: '중복 체크여부', desc: '동일 거래 중복 처리 방지' },
            { key: 'useMasterAccount', label: '모계좌 관리여부', desc: '모계좌 기반 계좌 관리' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="py-3 border-b border-gray-50">
              <Toggle value={form[key as keyof InstitutionFormData] as boolean}
                onChange={v => set(key as keyof InstitutionFormData, v)}
                label={label} desc={desc} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Step 2: 메모 ───────────────────────────────────────────────────────────
function Step2({ form, set }: { form: InstitutionFormData; set: SetFn }) {
  return (
    <div>
      <Field label="메모" hint="최대 1000자">
        <textarea className="form-input resize-none" rows={10} value={form.memo}
          onChange={e => set('memo', e.target.value)} placeholder="기관 관련 메모를 입력하세요." maxLength={1000} />
        <p className="text-right text-xs text-gray-400 mt-1">{form.memo.length} / 1000</p>
      </Field>
    </div>
  )
}

// ── Step 3: 서비스 분류 ────────────────────────────────────────────────────
function RelayTargetsTable({ targets, onChange }: {
  targets: RelayTarget[]
  onChange: (targets: RelayTarget[]) => void
}) {
  const add = () => onChange([...targets, { bankName: '', bankCode: '', settlementCode: '', conversionCode: '' }])
  const remove = (i: number) => onChange(targets.filter((_, idx) => idx !== i))
  const update = (i: number, field: keyof RelayTarget, value: string) =>
    onChange(targets.map((t, idx) => idx === i ? { ...t, [field]: value } : t))

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2">은행</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2">은행 기관코드</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2">금결원 기관코드</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2">변환 기관코드</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {targets.length === 0 && (
              <tr><td colSpan={5} className="text-center text-gray-400 text-xs py-4">
                아래 버튼을 눌러 중계 대상을 추가하세요.
              </td></tr>
            )}
            {targets.map((t, i) => (
              <tr key={i} className="border-t border-gray-50">
                <td className="px-3 py-2">
                  <input className="form-input text-xs py-1.5" value={t.bankName}
                    onChange={e => update(i, 'bankName', e.target.value)} placeholder="국민은행" />
                </td>
                <td className="px-3 py-2">
                  <input className="form-input text-xs py-1.5 font-mono" value={t.bankCode}
                    onChange={e => update(i, 'bankCode', e.target.value.toUpperCase())} placeholder="KBKR01" />
                </td>
                <td className="px-3 py-2">
                  <input className="form-input text-xs py-1.5 font-mono" value={t.settlementCode}
                    onChange={e => update(i, 'settlementCode', e.target.value.toUpperCase())} placeholder="KFTC01" />
                </td>
                <td className="px-3 py-2">
                  <input className="form-input text-xs py-1.5 font-mono" value={t.conversionCode}
                    onChange={e => update(i, 'conversionCode', e.target.value.toUpperCase())} placeholder="CONV01" />
                </td>
                <td className="px-2 py-2">
                  <button type="button" onClick={() => remove(i)}
                    className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={add}
        className="mt-2 flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-medium transition-colors">
        <Plus className="w-4 h-4" /> 중계 대상 추가
      </button>
    </div>
  )
}

function ArsSourcesTable({ sources, onChange }: {
  sources: ArsSource[]
  onChange: (sources: ArsSource[]) => void
}) {
  const add = () => onChange([...sources, { sourceCode: '', scenarioCode: '', ratio: '' }])
  const remove = (i: number) => onChange(sources.filter((_, idx) => idx !== i))
  const update = (i: number, field: keyof ArsSource, value: string | number) =>
    onChange(sources.map((s, idx) => idx === i ? { ...s, [field]: value } : s))

  const totalRatio = sources.reduce((sum, s) => sum + (Number(s.ratio) || 0), 0)

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2">원천사 코드</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2">시나리오 코드</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2 w-24">비율 (%)</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {sources.length === 0 && (
              <tr><td colSpan={4} className="text-center text-gray-400 text-xs py-4">
                아래 버튼을 눌러 원천사를 추가하세요.
              </td></tr>
            )}
            {sources.map((s, i) => (
              <tr key={i} className="border-t border-gray-50">
                <td className="px-3 py-2">
                  <input className="form-input text-xs py-1.5" value={s.sourceCode}
                    onChange={e => update(i, 'sourceCode', e.target.value.toUpperCase())}
                    placeholder="SRC001" />
                </td>
                <td className="px-3 py-2">
                  <input className="form-input text-xs py-1.5" value={s.scenarioCode}
                    onChange={e => update(i, 'scenarioCode', e.target.value)}
                    placeholder="SCEN_001" />
                </td>
                <td className="px-3 py-2">
                  <input type="number" className="form-input text-xs py-1.5" value={s.ratio}
                    onChange={e => update(i, 'ratio', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="50" min={1} max={100} />
                </td>
                <td className="px-2 py-2">
                  <button type="button" onClick={() => remove(i)}
                    className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {sources.length > 0 && (
            <tfoot className="border-t border-gray-100 bg-gray-50">
              <tr>
                <td colSpan={2} className="px-3 py-2 text-xs text-gray-500 font-medium text-right">합계</td>
                <td className="px-3 py-2">
                  <span className={clsx('text-xs font-bold', totalRatio === 100 ? 'text-green-600' : 'text-orange-500')}>
                    {totalRatio}%
                  </span>
                  {totalRatio !== 100 && <span className="text-xs text-orange-400 ml-1">(100% 권장)</span>}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <button type="button" onClick={add}
        className="mt-2 flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-medium transition-colors">
        <Plus className="w-4 h-4" /> 원천사 추가
      </button>
    </div>
  )
}

// ── 부가서비스 서브모달 ───────────────────────────────────────────────────
function VasSubModal({ form, set, onClose }: { form: InstitutionFormData; set: SetFn; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col" style={{ maxHeight: '88vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-base font-semibold text-gray-900">부가서비스 설정</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* ARS */}
          <div className={clsx('rounded-xl border-2 transition-colors overflow-hidden',
            form.useArs ? 'border-blue-300' : 'border-gray-100')}>
            <div className={clsx('flex items-center justify-between px-5 py-4',
              form.useArs ? 'bg-blue-50' : 'bg-gray-50')}>
              <div>
                <p className={clsx('font-semibold', form.useArs ? 'text-blue-700' : 'text-gray-700')}>ARS</p>
                <p className="text-xs text-gray-400 mt-0.5">자동응답 서비스 — 원천사 및 시나리오 코드 설정</p>
              </div>
              <Toggle value={form.useArs} onChange={v => set('useArs', v)} />
            </div>
            {form.useArs && (
              <div className="px-5 py-4 border-t border-gray-100">
                <ArsSourcesTable sources={form.arsSources} onChange={sources => set('arsSources', sources)} />
              </div>
            )}
          </div>

          {/* OTP */}
          <div className={clsx('rounded-xl border-2 transition-colors overflow-hidden',
            form.useOtp ? 'border-blue-300' : 'border-gray-100')}>
            <div className={clsx('flex items-center justify-between px-5 py-4',
              form.useOtp ? 'bg-blue-50' : 'bg-gray-50')}>
              <div>
                <p className={clsx('font-semibold', form.useOtp ? 'text-blue-700' : 'text-gray-700')}>OTP</p>
                <p className="text-xs text-gray-400 mt-0.5">일회용 비밀번호 서비스</p>
              </div>
              <Toggle value={form.useOtp} onChange={v => set('useOtp', v)} />
            </div>
            {form.useOtp && (
              <div className="px-5 py-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4">
                  <Field label="발급 방식">
                    <Sel value={form.otpIssueMethod} onChange={v => set('otpIssueMethod', v)}
                      options={Object.entries(OTP_METHOD_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                      placeholder="선택" />
                  </Field>
                  <Field label="유효시간 (초)">
                    <input type="number" className="form-input" value={form.otpValiditySeconds}
                      onChange={e => set('otpValiditySeconds', e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="180" min={30} />
                  </Field>
                  <Field label="자릿수">
                    <input type="number" className="form-input" value={form.otpDigits}
                      onChange={e => set('otpDigits', e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="6" min={4} max={8} />
                  </Field>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl shrink-0">
          <button type="button" onClick={onClose} className="btn-primary px-6">완료</button>
        </div>
      </div>
    </div>
  )
}

// ── 펌뱅킹 서브모달 ──────────────────────────────────────────────────────
function FirmBankingSubModal({ form, set, onClose }: { form: InstitutionFormData; set: SetFn; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col" style={{ maxHeight: '88vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-base font-semibold text-gray-900">펌뱅킹 설정</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* 서비스 유형 선택 카드 */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">서비스 유형</p>
            <div className="grid grid-cols-3 gap-4">
              <div className={clsx('rounded-xl border-2 p-4 cursor-pointer transition-colors select-none',
                form.useFbGeneral ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white',
                (form.useFbTrust || form.useFbRedebit) ? 'opacity-40 pointer-events-none' : '')}
                onClick={() => { if (!form.useFbTrust && !form.useFbRedebit) set('useFbGeneral', !form.useFbGeneral) }}>
                <p className="font-semibold text-gray-800">일반</p>
                <p className="text-xs text-gray-400 mt-1">중계 / 재판매</p>
              </div>
              <div className={clsx('rounded-xl border-2 p-4 cursor-pointer transition-colors select-none',
                form.useFbTrust ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white',
                form.useFbRedebit ? 'opacity-40 pointer-events-none' : '')}
                onClick={() => { if (!form.useFbRedebit) { const next = !form.useFbTrust; set('useFbTrust', next); if (next) { set('useFbGeneral', false); set('useFbRelay', false); set('useFbResale', false) } } }}>
                <p className="font-semibold text-gray-800">수탁</p>
                <p className="text-xs text-gray-400 mt-1">타 서비스 불가</p>
              </div>
              <div className={clsx('rounded-xl border-2 p-4 cursor-pointer transition-colors select-none',
                form.useFbRedebit ? 'border-rose-500 bg-rose-50' : 'border-gray-200 bg-white',
                form.useFbTrust ? 'opacity-40 pointer-events-none' : '')}
                onClick={() => { if (!form.useFbTrust) { const next = !form.useFbRedebit; set('useFbRedebit', next); if (next) { set('useFbGeneral', false); set('useFbRelay', false); set('useFbResale', false) } } }}>
                <p className="font-semibold text-gray-800">재판출금</p>
                <p className="text-xs text-gray-400 mt-1">타 서비스 불가</p>
              </div>
            </div>
          </div>

          {/* 일반 상세 */}
          {form.useFbGeneral && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">일반 서비스 설정</p>
              {/* 중계 */}
              <div className={clsx('rounded-xl border-2 overflow-hidden', form.useFbRelay ? 'border-blue-300' : 'border-gray-100')}>
                <div className={clsx('flex items-center justify-between px-5 py-4', form.useFbRelay ? 'bg-blue-50' : 'bg-gray-50')}>
                  <div>
                    <p className={clsx('font-semibold', form.useFbRelay ? 'text-blue-700' : 'text-gray-700')}>중계</p>
                    <p className="text-xs text-gray-400 mt-0.5">중계 대상 기관 설정</p>
                  </div>
                  <Toggle value={form.useFbRelay} onChange={v => set('useFbRelay', v)} />
                </div>
                {form.useFbRelay && (
                  <div className="px-5 py-4 border-t border-gray-100">
                    <RelayTargetsTable targets={form.relayTargets} onChange={targets => set('relayTargets', targets)} />
                  </div>
                )}
              </div>
              {/* 재판매 */}
              <div className={clsx('rounded-xl border-2 overflow-hidden', form.useFbResale ? 'border-green-300' : 'border-gray-100')}>
                <div className={clsx('flex items-center justify-between px-5 py-4', form.useFbResale ? 'bg-green-50' : 'bg-gray-50')}>
                  <div>
                    <p className={clsx('font-semibold', form.useFbResale ? 'text-green-700' : 'text-gray-700')}>재판매</p>
                    <p className="text-xs text-gray-400 mt-0.5">재판매 기관 및 마진율 설정</p>
                  </div>
                  <Toggle value={form.useFbResale} onChange={v => set('useFbResale', v)} />
                </div>
                {form.useFbResale && (
                  <div className="px-5 py-4 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-4">
                      <Field label="재판매 기관코드">
                        <input className="form-input" value={form.resaleInstitutionCode}
                          onChange={e => set('resaleInstitutionCode', e.target.value)} placeholder="기관코드" />
                      </Field>
                      <Field label="재판매 유형">
                        <Sel value={form.resaleTypeCode} onChange={v => set('resaleTypeCode', v)}
                          options={resaleTypes} placeholder="선택" />
                      </Field>
                      <Field label="마진율 (%)">
                        <input type="number" className="form-input" value={form.resaleMarginRate}
                          onChange={e => set('resaleMarginRate', e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="0" min={0} max={100} />
                      </Field>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 수탁 상세 */}
          {form.useFbTrust && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">수탁 설정</p>
              <div className="grid grid-cols-3 gap-4">
                <Field label="수탁 유형">
                  <Sel value={form.trustTypeCode} onChange={v => set('trustTypeCode', v)}
                    options={trustTypes} placeholder="선택" />
                </Field>
                <Field label="한도 금액">
                  <input type="number" className="form-input" value={form.trustLimitAmount}
                    onChange={e => set('trustLimitAmount', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0" min={0} />
                </Field>
                <Field label="정산 주기">
                  <Sel value={form.trustSettlementCycleCode} onChange={v => set('trustSettlementCycleCode', v)}
                    options={trustSettlementCycles} placeholder="선택" />
                </Field>
              </div>
            </div>
          )}

          {/* 재판출금 상세 */}
          {form.useFbRedebit && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">재판출금 설정</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="재판출금 유형">
                  <Sel value={form.redebitTypeCode} onChange={v => set('redebitTypeCode', v)}
                    options={redebitTypes} placeholder="선택" />
                </Field>
                <Field label="일 한도 금액">
                  <input type="number" className="form-input" value={form.redebitDailyLimitAmount}
                    onChange={e => set('redebitDailyLimitAmount', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0" min={0} />
                </Field>
                <Field label="재판출금 기관코드">
                  <input className="form-input" value={form.redebitInstitutionCode}
                    onChange={e => set('redebitInstitutionCode', e.target.value)} placeholder="기관코드" />
                </Field>
                <Field label="처리 유형">
                  <Sel value={form.redebitProcessTypeCode} onChange={v => set('redebitProcessTypeCode', v)}
                    options={redebitProcessTypes} placeholder="선택" />
                </Field>
              </div>
            </div>
          )}

          {!form.useFbGeneral && !form.useFbTrust && !form.useFbRedebit && (
            <p className="text-center text-sm text-gray-400 py-6">서비스 유형을 선택하세요.</p>
          )}
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl shrink-0">
          <button type="button" onClick={onClose} className="btn-primary px-6">완료</button>
        </div>
      </div>
    </div>
  )
}

// ── Step 3: 서비스 분류 (서브모달 방식) ────────────────────────────────────
type ServiceKey = 'vas' | 'firmbanking'
function Step3({ form, set, onEditService }: {
  form: InstitutionFormData; set: SetFn
  onEditService: (key: ServiceKey) => void
}) {
  const resaleTypes           = useCodeTable('RESALE_TYPE')
  const trustTypes            = useCodeTable('TRUST_TYPE')
  const trustSettlementCycles = useCodeTable('TRUST_SETTLEMENT_CYCLE')
  const redebitTypes          = useCodeTable('REDEBIT_TYPE')
  const redebitProcessTypes   = useCodeTable('REDEBIT_PROCESS_TYPE')

  const vasConfigured = form.useArs || form.useOtp
  const fbConfigured = form.useFbGeneral || form.useFbTrust || form.useFbRedebit
  return (
    <div className="space-y-4">
      <SectionBox title="부가서비스" desc="ARS, OTP 등 부가 서비스 설정"
        enabled={form.useValueAddedService}
        configured={vasConfigured}
        onToggle={v => { set('useValueAddedService', v); if (v) onEditService('vas'); else { set('useArs', false); set('useOtp', false) } }}
        onEdit={() => onEditService('vas')}
      />
      <SectionBox title="펌뱅킹" desc="펌뱅킹 서비스 (일반/수탁/재판출금)"
        enabled={form.useFirmBanking}
        configured={fbConfigured}
        onToggle={v => { set('useFirmBanking', v); if (v) onEditService('firmbanking'); else { set('useFbGeneral', false); set('useFbRelay', false); set('useFbResale', false); set('useFbTrust', false); set('useFbRedebit', false) } }}
        onEdit={() => onEditService('firmbanking')}
      />
      {!form.useValueAddedService && !form.useFirmBanking && (
        <p className="text-center text-sm text-gray-400 py-4">서비스를 선택하지 않으면 기본 등록됩니다.</p>
      )}
    </div>
  )
}

// ── 유효성 검사 ────────────────────────────────────────────────────────────
type SetFn = <K extends keyof InstitutionFormData>(field: K, value: InstitutionFormData[K]) => void

function validateStep(step: StepIndex, form: InstitutionFormData): string[] {
  const errs: string[] = []
  if (step === 0) {
    if (!form.code.match(/^[A-Z0-9]{2,20}$/)) errs.push('기관코드는 영문 대문자/숫자 2~20자이어야 합니다.')
    if (!form.name.trim()) errs.push('기관명을 입력해주세요.')
    const needsApiKey = ['PUBLIC', 'PUBLIC_VPN'].includes(form.commLineType)
    if (needsApiKey && !form.apiKey.trim()) errs.push('API KEY를 입력해주세요.')
    const needsCommCode = ['DEDICATED', 'PUBLIC_VPN', 'DEDICATED_VPN'].includes(form.commLineType)
    if (needsCommCode && !form.commInstitutionCode.trim()) errs.push('통신 기관코드를 입력해주세요.')
  }
  if (step === 2) {
    if (form.useArs && form.arsSources.length === 0) errs.push('ARS 사용 시 원천사를 1개 이상 추가해주세요.')
    if (form.useArs) {
      form.arsSources.forEach((s, i) => {
        if (!s.sourceCode) errs.push(`원천사 ${i + 1}: 원천사 코드를 입력해주세요.`)
        if (!s.scenarioCode) errs.push(`원천사 ${i + 1}: 시나리오 코드를 입력해주세요.`)
        if (!s.ratio) errs.push(`원천사 ${i + 1}: 비율을 입력해주세요.`)
      })
    }
    if (form.useOtp && !form.otpIssueMethod) errs.push('OTP 발급 방식을 선택해주세요.')
  }
  return errs
}

// ── 등록/수정 모달 ─────────────────────────────────────────────────────────
interface ModalProps {
  mode: 'create' | 'edit'
  initial?: InstitutionFormData
  editId?: number
  onClose: () => void
  onSave: (data: InstitutionFormData, id?: number) => Promise<void>
}

function InstitutionModal({ mode, initial, editId, onClose, onSave }: ModalProps) {
  const [step, setStep] = useState<StepIndex>(0)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [form, setForm] = useState<InstitutionFormData>(initial ?? EMPTY_FORM)
  const [stepErrors, setStepErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')
  const [subModal, setSubModal] = useState<ServiceKey | null>(null)

  const set: SetFn = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const goNext = () => {
    const errs = validateStep(step, form)
    if (errs.length > 0) { setStepErrors(errs); return }
    setStepErrors([])
    setCompleted(prev => new Set([...prev, step]))
    setStep(prev => Math.min(prev + 1, 2) as StepIndex)
  }

  const goPrev = () => {
    setStepErrors([])
    setStep(prev => Math.max(prev - 1, 0) as StepIndex)
  }


  const handleSave = async () => {
    const errs = validateStep(step, form)
    if (errs.length > 0) { setStepErrors(errs); return }
    setApiError(''); setSaving(true)
    try {
      await onSave(form, editId)
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setApiError(msg ?? '저장 중 오류가 발생했습니다.')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '92vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-gray-900">
              {mode === 'create' ? '기관 등록' : '기관 수정'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper */}
        <Stepper current={step} completed={completed} />

        {/* Body */}
        <form onSubmit={e => e.preventDefault()} onKeyDown={e => { if (e.key === 'Enter') e.preventDefault() }} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {step === 0 && <Step1 form={form} set={set} isEdit={mode === 'edit'} />}
            {step === 1 && <Step2 form={form} set={set} />}
            {step === 2 && <Step3 form={form} set={set} onEditService={setSubModal} />}
            {subModal === 'vas' && <VasSubModal form={form} set={set} onClose={() => setSubModal(null)} />}
            {subModal === 'firmbanking' && <FirmBankingSubModal form={form} set={set} onClose={() => setSubModal(null)} />}

            {stepErrors.length > 0 && (
              <div className="mt-4 bg-red-50 border border-red-100 rounded-lg px-4 py-3 space-y-1">
                {stepErrors.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {e}
                  </div>
                ))}
              </div>
            )}
            {apiError && (
              <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" /> {apiError}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl shrink-0">
            <button type="button" onClick={step === 0 ? onClose : goPrev}
              className="btn-secondary flex items-center gap-1.5">
              <ChevronLeft className="w-4 h-4" />{step === 0 ? '취소' : '이전'}
            </button>
            {step < 2
              ? <button type="button" onClick={goNext}
                  className="btn-primary flex items-center gap-1.5">
                  다음 <ChevronRight className="w-4 h-4" />
                </button>
              : <button type="button" onClick={handleSave} disabled={saving}
                  className="btn-primary disabled:opacity-60">
                  {saving ? '저장 중...' : mode === 'create' ? '등록 완료' : '수정 완료'}
                </button>
            }
          </div>
        </form>
      </div>
    </div>
  )
}

// ── 기관 상세 패널 ────────────────────────────────────────────────────────
function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <div className="text-sm font-medium text-gray-800 truncate">
        {value ?? <span className="text-gray-300 font-normal">-</span>}
      </div>
    </div>
  )
}

function BoolBadge({ value, label, desc }: { value: boolean; label: string; desc?: string }) {
  return (
    <span className="relative group/tip">
      <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium cursor-default',
        value ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-400')}>
        {label}
      </span>
      {desc && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-20 shadow-lg">
          {desc}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </span>
      )}
    </span>
  )
}

function InstitutionDetail({ inst }: { inst: Institution }) {
  return (
    <div className="bg-slate-50 border-t-2 border-primary/20 px-6 py-5 space-y-5">
      {/* 기본 정보 */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">기본 정보</h4>
        <div className="grid grid-cols-5 gap-x-6 gap-y-4">
          <InfoItem label="기관코드" value={<span className="font-mono">{inst.code}</span>} />
          <InfoItem label="그룹 기관코드" value={inst.groupCode ? <span className="font-mono">{inst.groupCode}</span> : null} />
          <InfoItem label="기관명" value={inst.name} />
          <InfoItem label="계약 유형" value={inst.contractTypeCode} />
          <InfoItem label="영업 담당자" value={inst.salesManagerName} />
          <InfoItem label="업종 구분" value={inst.businessTypeCode} />
          <InfoItem label="AML 서비스" value={inst.amlServiceTypeCode} />
          <InfoItem label="서비스 유형" value={inst.serviceTypeCode} />
          <InfoItem label="사업자 번호" value={inst.businessNumber} />
          <InfoItem label="상태" value={
            <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium',
              inst.status === 'ACTIVE' ? 'bg-green-100 text-green-700'
              : inst.status === 'INACTIVE' ? 'bg-gray-100 text-gray-500'
              : 'bg-red-100 text-red-600')}>
              {inst.statusLabel}
            </span>
          } />
        </div>
      </div>

      {/* 통신 정보 */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">통신 정보</h4>
        <div className="grid grid-cols-5 gap-x-6 gap-y-4">
          <InfoItem label="통신 방식" value={inst.commLineTypeLabel
            ? <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-medium">{inst.commLineTypeLabel}</span>
            : null} />
          <InfoItem label="API KEY" value={inst.apiKey
            ? <span className="font-mono text-xs text-gray-600">{inst.apiKey.substring(0, 16)}…</span>
            : null} />
          <InfoItem label="통신 기관코드" value={inst.commInstitutionCode
            ? <span className="font-mono">{inst.commInstitutionCode}</span> : null} />
        </div>
      </div>

      {/* 추가 옵션 */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">추가 옵션</h4>
        <div className="grid grid-cols-5 gap-x-6 gap-y-4 mb-3">
          <InfoItem label="전문 유형" value={inst.messageTypeCode} />
          <InfoItem label="타임아웃 (ms)" value={inst.timeoutTerm?.toLocaleString()} />
          <InfoItem label="응답 구분코드" value={inst.responseTypeCode} />
        </div>
        <div className="flex flex-wrap gap-2">
          <BoolBadge value={inst.useBalancing} label="밸런싱" desc="트래픽 로드 밸런싱 사용 여부" />
          <BoolBadge value={inst.useAgentFile} label="대행파일" desc="배치 대행파일 처리 기능 여부" />
          <BoolBadge value={inst.useAgentTxNo} label="거래번호 채번" desc="거래번호 자동 채번 여부 (대행파일 처리 시 적용)" />
          <BoolBadge value={inst.useDuplicateCheck} label="중복체크" desc="동일 거래 중복 처리 방지 여부" />
          <BoolBadge value={inst.useMasterAccount} label="모계좌" desc="모계좌 기반 계좌 관리 여부" />
        </div>
      </div>

      {/* 서비스 */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">서비스</h4>
        <div className="flex flex-wrap gap-2">
          {inst.useValueAddedService ? (
            <>
              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">부가서비스</span>
              {inst.useArs && <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">ARS ({inst.arsSources.length}개 원천사)</span>}
              {inst.useOtp && <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">OTP · {inst.otpIssueMethod} · {inst.otpDigits}자리</span>}
            </>
          ) : <span className="text-xs text-gray-400">부가서비스 미사용</span>}
        </div>
        {inst.useFirmBanking && (
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2.5 py-1 bg-violet-100 text-violet-700 rounded-lg text-xs font-semibold">펌뱅킹</span>
            {inst.useFbGeneral && <span className="px-2.5 py-1 bg-violet-50 text-violet-600 rounded-lg text-xs font-medium">일반</span>}
            {inst.useFbRelay && <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">중계 ({inst.relayTargets.length}개)</span>}
            {inst.useFbResale && <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium">재판매 · {inst.resaleTypeCode}</span>}
            {inst.useFbTrust && <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">수탁 · {inst.trustTypeCode}</span>}
            {inst.useFbRedebit && <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-medium">재판출금</span>}
          </div>
        )}
      </div>

      {/* 메모 */}
      {inst.memo && (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">메모</h4>
          <p className="text-sm text-gray-600 whitespace-pre-wrap bg-white rounded-lg px-4 py-3 border border-gray-100">{inst.memo}</p>
        </div>
      )}
    </div>
  )
}

// ── 삭제 확인 ──────────────────────────────────────────────────────────────
function DeleteConfirmModal({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-base font-semibold text-center mb-1">기관 삭제</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          <span className="font-medium text-gray-700">"{name}"</span> 을(를) 삭제하시겠습니까?<br/>이 작업은 되돌릴 수 없습니다.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">취소</button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition-colors">삭제</button>
        </div>
      </div>
    </div>
  )
}

// ── 메인 ────────────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<InstitutionStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-500',
  SUSPENDED: 'bg-red-100 text-red-600',
}

export default function Institutions() {
  const [data, setData] = useState<Page<Institution> | null>(null)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<InstitutionStatus | ''>('')
  const [page, setPage] = useState(0)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editTarget, setEditTarget] = useState<Institution | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Institution | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const load = async (p = page) => {
    const params = new URLSearchParams({ page: String(p), size: '10' })
    if (keyword) params.set('keyword', keyword)
    if (statusFilter) params.set('status', statusFilter)
    const res = await api.get<Page<Institution>>(`/institutions?${params}`)
    setData(res.data)
  }

  useEffect(() => { load() }, [page, statusFilter])

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(0); load(0) }

  const handleSave = async (form: InstitutionFormData, id?: number) => {
    const payload = { ...form, commLineType: form.commLineType || null }
    if (id) await api.put(`/institutions/${id}`, payload)
    else await api.post('/institutions', payload)
    setPage(0); load(0)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await api.delete(`/institutions/${deleteTarget.id}`)
    setDeleteTarget(null); load()
  }

  const toForm = (inst: Institution): InstitutionFormData => ({
    code: inst.code, groupCode: inst.groupCode ?? '', name: inst.name,
    contractTypeCode: inst.contractTypeCode ?? '', salesManagerName: inst.salesManagerName ?? '',
    businessTypeCode: inst.businessTypeCode ?? '', status: inst.status,
    amlServiceTypeCode: inst.amlServiceTypeCode ?? '', serviceTypeCode: inst.serviceTypeCode ?? '',
    businessNumber: inst.businessNumber ?? '', apiKey: inst.apiKey ?? '',
    commLineType: (inst.commLineType ?? '') as CommLineType | '',
    commInstitutionCode: inst.commInstitutionCode ?? '',
    useBalancing: inst.useBalancing, responseTypeCode: inst.responseTypeCode ?? '',
    useAgentTxNo: inst.useAgentTxNo, messageTypeCode: inst.messageTypeCode ?? '',
    timeoutTerm: inst.timeoutTerm ?? '', useAgentFile: inst.useAgentFile,
    useDuplicateCheck: inst.useDuplicateCheck, useMasterAccount: inst.useMasterAccount,
    memo: inst.memo ?? '', useValueAddedService: inst.useValueAddedService,
    useArs: inst.useArs,
    arsSources: inst.arsSources.map(s => ({ sourceCode: s.sourceCode, scenarioCode: s.scenarioCode, ratio: s.ratio })),
    useOtp: inst.useOtp, otpIssueMethod: inst.otpIssueMethod ?? '',
    otpValiditySeconds: inst.otpValiditySeconds ?? '', otpDigits: inst.otpDigits ?? '',
    useFirmBanking: inst.useFirmBanking,
    useFbGeneral: inst.useFbGeneral, useFbRelay: inst.useFbRelay,
    relayTargets: inst.relayTargets ?? [],
    useFbResale: inst.useFbResale,
    resaleInstitutionCode: inst.resaleInstitutionCode ?? '', resaleTypeCode: inst.resaleTypeCode ?? '', resaleMarginRate: inst.resaleMarginRate ?? '',
    useFbTrust: inst.useFbTrust,
    trustTypeCode: inst.trustTypeCode ?? '', trustLimitAmount: inst.trustLimitAmount ?? '', trustSettlementCycleCode: inst.trustSettlementCycleCode ?? '',
    useFbRedebit: inst.useFbRedebit,
    redebitTypeCode: inst.redebitTypeCode ?? '', redebitDailyLimitAmount: inst.redebitDailyLimitAmount ?? '', redebitInstitutionCode: inst.redebitInstitutionCode ?? '', redebitProcessTypeCode: inst.redebitProcessTypeCode ?? '',
    balancingItems: inst.balancingItems ?? [],
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">기관 관리</h1>
          <p className="text-sm text-gray-500 mt-1">등록된 기관을 조회하고 관리합니다.</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" /> 기관 등록
        </button>
      </div>

      <div className="card py-4">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 flex-1 min-w-52">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input className="bg-transparent text-sm outline-none w-full placeholder-gray-400"
              placeholder="기관코드, 그룹코드, 기관명 검색"
              value={keyword} onChange={e => setKeyword(e.target.value)} />
          </div>
          <select className="form-input w-32" value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as InstitutionStatus | ''); setPage(0) }}>
            <option value="">전체 상태</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button type="submit" className="btn-primary">검색</button>
        </form>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">
            전체 <span className="text-primary font-bold">{data?.totalElements ?? 0}</span> 건
          </span>
        </div>
        <div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3 w-8"></th>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3 whitespace-nowrap">기관코드</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3 whitespace-nowrap hidden lg:table-cell">그룹코드</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3 whitespace-nowrap">기관명</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3 whitespace-nowrap hidden xl:table-cell">업종</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3 whitespace-nowrap hidden xl:table-cell">서비스유형</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3 whitespace-nowrap hidden md:table-cell">통신방식</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3 whitespace-nowrap hidden lg:table-cell">ARS</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3 whitespace-nowrap hidden lg:table-cell">OTP</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3 whitespace-nowrap hidden md:table-cell">펌뱅킹</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3 whitespace-nowrap">상태</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3 whitespace-nowrap hidden lg:table-cell">등록일</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data?.content.length === 0 && (
                <tr><td colSpan={13} className="text-center text-gray-400 py-16">
                  <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />등록된 기관이 없습니다.
                </td></tr>
              )}
              {data?.content.map(inst => {
                const expanded = selectedId === inst.id
                return (
                  <React.Fragment key={inst.id}>
                    <tr
                      className={clsx('border-b border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer',
                        expanded && 'bg-primary/5 border-b-0')}
                      onClick={() => setSelectedId(expanded ? null : inst.id)}>
                      <td className="px-3 py-3 w-8">
                        <ChevronDown className={clsx('w-4 h-4 text-gray-400 transition-transform', expanded && 'rotate-180')} />
                      </td>
                      <td className="px-3 py-3 font-mono text-xs font-semibold text-gray-700">{inst.code}</td>
                      <td className="px-3 py-3 font-mono text-xs text-gray-400 hidden lg:table-cell">{inst.groupCode ?? '-'}</td>
                      <td className="px-3 py-3 font-medium text-gray-900">{inst.name}</td>
                      <td className="px-3 py-3 text-gray-500 text-xs hidden xl:table-cell">{inst.businessTypeCode ?? '-'}</td>
                      <td className="px-3 py-3 text-gray-500 text-xs hidden xl:table-cell">{inst.serviceTypeCode ?? '-'}</td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        {inst.commLineType
                          ? <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium whitespace-nowrap">{inst.commLineTypeLabel}</span>
                          : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <span className={clsx('px-2 py-1 text-xs rounded font-medium whitespace-nowrap',
                          inst.useArs ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-400')}>
                          {inst.useArs ? '사용' : '-'}
                        </span>
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <span className={clsx('px-2 py-1 text-xs rounded font-medium whitespace-nowrap',
                          inst.useOtp ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-400')}>
                          {inst.useOtp ? '사용' : '-'}
                        </span>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <span className={clsx('px-2 py-1 text-xs rounded font-medium whitespace-nowrap',
                          inst.useFirmBanking ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-400')}>
                          {inst.useFirmBanking ? '사용' : '-'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={clsx('px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap', STATUS_BADGE[inst.status])}>
                          {inst.statusLabel}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-400 text-xs whitespace-nowrap hidden lg:table-cell">
                        {new Date(inst.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditTarget(inst); setModal('edit') }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(inst)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="border-b border-primary/20">
                        <td colSpan={14} className="p-0">
                          <InstitutionDetail inst={inst} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">{page * 10 + 1}–{Math.min((page + 1) * 10, data.totalElements)} / {data.totalElements}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: data.totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={clsx('w-8 h-8 rounded-lg text-sm font-medium',
                    i === page ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-600')}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => p + 1)} disabled={page === data.totalPages - 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {modal === 'create' && (
        <InstitutionModal mode="create" onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal === 'edit' && editTarget && (
        <InstitutionModal mode="edit" editId={editTarget.id} initial={toForm(editTarget)}
          onClose={() => { setModal(null); setEditTarget(null) }} onSave={handleSave} />
      )}
      {deleteTarget && (
        <DeleteConfirmModal name={deleteTarget.name}
          onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  )
}
