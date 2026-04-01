package com.admin.dto;

import com.admin.entity.Institution;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class InstitutionRequest {

    // 기본 정보
    @NotBlank
    @Pattern(regexp = "^[A-Z0-9]{2,20}$", message = "기관 코드는 영문 대문자/숫자 2~20자이어야 합니다.")
    private String code;

    private String groupCode;

    @NotBlank
    private String name;

    private String contractTypeCode;
    private String salesManagerName;
    private String businessTypeCode;

    @NotNull
    private Institution.Status status = Institution.Status.ACTIVE;

    private String amlServiceTypeCode;
    private String serviceTypeCode;

    @Pattern(regexp = "^(\\d{3}-\\d{2}-\\d{5})?$", message = "사업자 번호 형식이 올바르지 않습니다.")
    private String businessNumber;

    // 통신 정보
    private String apiKey;
    private Institution.CommLineType commLineType;
    private String commInstitutionCode;

    // 추가 옵션
    private Boolean useBalancing = false;
    private String responseTypeCode;
    private Boolean useAgentTxNo = false;
    private String messageTypeCode;
    private Integer timeoutTerm;
    private Boolean useAgentFile = false;
    private Boolean useDuplicateCheck = false;
    private Boolean useMasterAccount = false;

    // 메모
    private String memo;

    // 서비스 분류: 부가서비스
    private Boolean useValueAddedService = false;

    private Boolean useArs = false;

    @Valid
    private List<ArsSourceRequest> arsSources = new ArrayList<>();

    private Boolean useOtp = false;
    private String otpIssueMethod;
    private Integer otpValiditySeconds;
    private Integer otpDigits;

    // 서비스 분류: 펌뱅킹
    private Boolean useFirmBanking = false;

    // 일반
    private Boolean useFbGeneral = false;
    private Boolean useFbRelay = false;

    @Valid
    private List<RelayTargetRequest> relayTargets = new ArrayList<>();

    private Boolean useFbResale = false;
    private String resaleInstitutionCode;
    private String resaleTypeCode;
    private Integer resaleMarginRate;

    // 수탁
    private Boolean useFbTrust = false;
    private String trustTypeCode;
    private Long trustLimitAmount;
    private String trustSettlementCycleCode;

    // 재판출금
    private Boolean useFbRedebit = false;
    private String redebitTypeCode;
    private Long redebitDailyLimitAmount;
    private String redebitInstitutionCode;
    private String redebitProcessTypeCode;
}
