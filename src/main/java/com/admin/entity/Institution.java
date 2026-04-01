package com.admin.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "institutions")
@Getter
@Setter
@NoArgsConstructor
public class Institution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── 기본 정보 ──────────────────────────────────────
    @Column(unique = true, nullable = false, length = 20)
    private String code;                    // 기관코드

    @Column(length = 20)
    private String groupCode;               // 그룹 기관코드

    @Column(nullable = false, length = 100)
    private String name;                    // 기관명

    @Column(length = 20)
    private String contractTypeCode;        // 계약 유형코드

    @Column(length = 50)
    private String salesManagerName;        // 영업 담당자명

    @Column(length = 20)
    private String businessTypeCode;        // 업종 구분코드

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;  // 기관 상태코드

    @Column(length = 20)
    private String amlServiceTypeCode;      // AML 서비스 유형코드

    @Column(length = 20)
    private String serviceTypeCode;         // 서비스 유형코드

    @Column(length = 20)
    private String businessNumber;          // 사업자 번호

    // ── 통신 정보 ──────────────────────────────────────
    @Column(length = 256)
    private String apiKey;                  // API KEY

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private CommLineType commLineType;      // 통신 회선 종류

    @Column(length = 20)
    private String commInstitutionCode;     // 통신 기관코드

    // ── 추가 옵션 ──────────────────────────────────────
    @Column(nullable = false)
    private Boolean useBalancing = false;   // 밸런싱 사용 여부

    @Column(length = 20)
    private String responseTypeCode;        // 응답 구분코드 (밸런싱 ON 시)

    @Column(nullable = false)
    private Boolean useAgentTxNo = false;   // 거래번호 대행 채번 여부 (대행파일 ON 시)

    @Column(length = 20)
    private String messageTypeCode;         // 전문 유형코드

    @Column
    private Integer timeoutTerm;            // 타임아웃 TERM (ms)

    @Column(nullable = false)
    private Boolean useAgentFile = false;   // 대행파일 처리여부

    @Column(nullable = false)
    private Boolean useDuplicateCheck = false; // 중복 체크여부

    @Column(nullable = false)
    private Boolean useMasterAccount = false;  // 모계좌 관리여부

    // ── 메모 ───────────────────────────────────────────
    @Column(length = 1000)
    private String memo;

    // ── 서비스 분류: 부가서비스 ────────────────────────────
    @Column(nullable = false)
    private Boolean useValueAddedService = false; // 부가서비스 사용여부

    // ARS
    @Column(nullable = false)
    private Boolean useArs = false;

    @OneToMany(mappedBy = "institution", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<InstitutionArsSource> arsSources = new ArrayList<>();

    // OTP
    @Column(nullable = false)
    private Boolean useOtp = false;

    @Column(length = 20)
    private String otpIssueMethod;      // OTP 발급 방식 (SMS, EMAIL, APP)

    @Column
    private Integer otpValiditySeconds; // OTP 유효시간 (초)

    @Column
    private Integer otpDigits;          // OTP 자릿수

    // ── 서비스 분류: 펌뱅킹 ──────────────────────────────
    @Column(nullable = false)
    private Boolean useFirmBanking = false;         // 펌뱅킹 사용여부 (부모)

    // 일반
    @Column(nullable = false)
    private Boolean useFbGeneral = false;           // 일반 사용여부

    @Column(nullable = false)
    private Boolean useFbRelay = false;             // 중계

    @OneToMany(mappedBy = "institution", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<InstitutionRelayTarget> relayTargets = new ArrayList<>();

    @Column(nullable = false)
    private Boolean useFbResale = false;            // 재판매
    @Column(length = 20) private String resaleInstitutionCode;
    @Column(length = 20) private String resaleTypeCode;
    @Column private Integer resaleMarginRate;

    // 수탁 (수탁/재판출금 선택 시 타 서비스 불가)
    @Column(nullable = false)
    private Boolean useFbTrust = false;
    @Column(length = 20) private String trustTypeCode;
    @Column private Long trustLimitAmount;
    @Column(length = 20) private String trustSettlementCycleCode;

    // 재판출금
    @Column(nullable = false)
    private Boolean useFbRedebit = false;
    @Column(length = 20) private String redebitTypeCode;
    @Column private Long redebitDailyLimitAmount;
    @Column(length = 20) private String redebitInstitutionCode;
    @Column(length = 20) private String redebitProcessTypeCode;

    // ── 시스템 ─────────────────────────────────────────
    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ── Enums ──────────────────────────────────────────
    public enum Status {
        ACTIVE, INACTIVE, SUSPENDED;
        public String getLabel() {
            return switch (this) {
                case ACTIVE -> "활성";
                case INACTIVE -> "비활성";
                case SUSPENDED -> "정지";
            };
        }
    }

    public enum CommLineType {
        INTERNET, API, DEDICATED, VPN;
        public String getLabel() {
            return switch (this) {
                case INTERNET -> "인터넷";
                case API -> "API";
                case DEDICATED -> "전용선";
                case VPN -> "VPN";
            };
        }
    }
}
