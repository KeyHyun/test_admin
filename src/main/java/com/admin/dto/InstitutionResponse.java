package com.admin.dto;

import com.admin.entity.Institution;
import com.admin.entity.InstitutionArsSource;
import com.admin.entity.InstitutionRelayTarget;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
public class InstitutionResponse {

    private final Long id;
    private final String code;
    private final String groupCode;
    private final String name;
    private final String contractTypeCode;
    private final String salesManagerName;
    private final String businessTypeCode;
    private final String status;
    private final String statusLabel;
    private final String amlServiceTypeCode;
    private final String serviceTypeCode;
    private final String businessNumber;
    private final String apiKey;
    private final String commLineType;
    private final String commLineTypeLabel;
    private final String commInstitutionCode;
    private final Boolean useBalancing;
    private final String responseTypeCode;
    private final Boolean useAgentTxNo;
    private final String messageTypeCode;
    private final Integer timeoutTerm;
    private final Boolean useAgentFile;
    private final Boolean useDuplicateCheck;
    private final Boolean useMasterAccount;
    private final String memo;

    // 부가서비스
    private final Boolean useValueAddedService;
    private final Boolean useArs;
    private final List<ArsSourceDto> arsSources;
    private final Boolean useOtp;
    private final String otpIssueMethod;
    private final Integer otpValiditySeconds;
    private final Integer otpDigits;

    // 펌뱅킹
    private final Boolean useFirmBanking;
    private final Boolean useFbGeneral;
    private final Boolean useFbRelay;
    private final List<RelayTargetDto> relayTargets;
    private final Boolean useFbResale;
    private final String resaleInstitutionCode;
    private final String resaleTypeCode;
    private final Integer resaleMarginRate;
    private final Boolean useFbTrust;
    private final String trustTypeCode;
    private final Long trustLimitAmount;
    private final String trustSettlementCycleCode;
    private final Boolean useFbRedebit;
    private final String redebitTypeCode;
    private final Long redebitDailyLimitAmount;
    private final String redebitInstitutionCode;
    private final String redebitProcessTypeCode;

    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public InstitutionResponse(Institution i) {
        this.id = i.getId();
        this.code = i.getCode();
        this.groupCode = i.getGroupCode();
        this.name = i.getName();
        this.contractTypeCode = i.getContractTypeCode();
        this.salesManagerName = i.getSalesManagerName();
        this.businessTypeCode = i.getBusinessTypeCode();
        this.status = i.getStatus().name();
        this.statusLabel = i.getStatus().getLabel();
        this.amlServiceTypeCode = i.getAmlServiceTypeCode();
        this.serviceTypeCode = i.getServiceTypeCode();
        this.businessNumber = i.getBusinessNumber();
        this.apiKey = i.getApiKey();
        this.commLineType = i.getCommLineType() != null ? i.getCommLineType().name() : null;
        this.commLineTypeLabel = i.getCommLineType() != null ? i.getCommLineType().getLabel() : null;
        this.commInstitutionCode = i.getCommInstitutionCode();
        this.useBalancing = i.getUseBalancing();
        this.responseTypeCode = i.getResponseTypeCode();
        this.useAgentTxNo = i.getUseAgentTxNo();
        this.messageTypeCode = i.getMessageTypeCode();
        this.timeoutTerm = i.getTimeoutTerm();
        this.useAgentFile = i.getUseAgentFile();
        this.useDuplicateCheck = i.getUseDuplicateCheck();
        this.useMasterAccount = i.getUseMasterAccount();
        this.memo = i.getMemo();
        this.useValueAddedService = i.getUseValueAddedService();
        this.useArs = i.getUseArs();
        this.arsSources = i.getArsSources().stream().map(ArsSourceDto::new).toList();
        this.useOtp = i.getUseOtp();
        this.otpIssueMethod = i.getOtpIssueMethod();
        this.otpValiditySeconds = i.getOtpValiditySeconds();
        this.otpDigits = i.getOtpDigits();
        this.useFirmBanking = i.getUseFirmBanking();
        this.useFbGeneral = i.getUseFbGeneral();
        this.useFbRelay = i.getUseFbRelay();
        this.relayTargets = i.getRelayTargets().stream().map(RelayTargetDto::new).toList();
        this.useFbResale = i.getUseFbResale();
        this.resaleInstitutionCode = i.getResaleInstitutionCode();
        this.resaleTypeCode = i.getResaleTypeCode();
        this.resaleMarginRate = i.getResaleMarginRate();
        this.useFbTrust = i.getUseFbTrust();
        this.trustTypeCode = i.getTrustTypeCode();
        this.trustLimitAmount = i.getTrustLimitAmount();
        this.trustSettlementCycleCode = i.getTrustSettlementCycleCode();
        this.useFbRedebit = i.getUseFbRedebit();
        this.redebitTypeCode = i.getRedebitTypeCode();
        this.redebitDailyLimitAmount = i.getRedebitDailyLimitAmount();
        this.redebitInstitutionCode = i.getRedebitInstitutionCode();
        this.redebitProcessTypeCode = i.getRedebitProcessTypeCode();
        this.createdAt = i.getCreatedAt();
        this.updatedAt = i.getUpdatedAt();
    }

    @Getter
    public static class ArsSourceDto {
        private final Long id;
        private final String sourceCode;
        private final String scenarioCode;
        private final Integer ratio;
        private final Integer sortOrder;

        public ArsSourceDto(InstitutionArsSource s) {
            this.id = s.getId();
            this.sourceCode = s.getSourceCode();
            this.scenarioCode = s.getScenarioCode();
            this.ratio = s.getRatio();
            this.sortOrder = s.getSortOrder();
        }
    }

    @Getter
    public static class RelayTargetDto {
        private final Long id;
        private final String bankName;
        private final String bankCode;
        private final String settlementCode;
        private final String conversionCode;
        private final Integer sortOrder;

        public RelayTargetDto(InstitutionRelayTarget t) {
            this.id = t.getId();
            this.bankName = t.getBankName();
            this.bankCode = t.getBankCode();
            this.settlementCode = t.getSettlementCode();
            this.conversionCode = t.getConversionCode();
            this.sortOrder = t.getSortOrder();
        }
    }
}
