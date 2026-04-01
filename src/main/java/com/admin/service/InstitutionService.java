package com.admin.service;

import com.admin.dto.ArsSourceRequest;
import com.admin.dto.InstitutionRequest;
import com.admin.dto.InstitutionResponse;
import com.admin.dto.RelayTargetRequest;
import com.admin.entity.Institution;
import com.admin.entity.InstitutionArsSource;
import com.admin.entity.InstitutionRelayTarget;
import com.admin.repository.InstitutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InstitutionService {

    private final InstitutionRepository institutionRepository;

    public Page<InstitutionResponse> search(String keyword, Institution.Status status, Pageable pageable) {
        return institutionRepository.search(keyword, status, pageable).map(InstitutionResponse::new);
    }

    public InstitutionResponse getById(Long id) {
        return new InstitutionResponse(findById(id));
    }

    @Transactional
    public InstitutionResponse create(InstitutionRequest request) {
        if (institutionRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("이미 사용 중인 기관 코드입니다: " + request.getCode());
        }
        Institution institution = new Institution();
        mapBase(request, institution);
        mapArsSources(request, institution);
        mapRelayTargets(request, institution);
        return new InstitutionResponse(institutionRepository.save(institution));
    }

    @Transactional
    public InstitutionResponse update(Long id, InstitutionRequest request) {
        Institution institution = findById(id);
        if (!institution.getCode().equals(request.getCode()) &&
            institutionRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("이미 사용 중인 기관 코드입니다: " + request.getCode());
        }
        mapBase(request, institution);
        institution.getArsSources().clear();
        mapArsSources(request, institution);
        institution.getRelayTargets().clear();
        mapRelayTargets(request, institution);
        return new InstitutionResponse(institution);
    }

    @Transactional
    public void delete(Long id) {
        institutionRepository.delete(findById(id));
    }

    private Institution findById(Long id) {
        return institutionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("기관을 찾을 수 없습니다: " + id));
    }

    private void mapBase(InstitutionRequest r, Institution i) {
        i.setCode(r.getCode());
        i.setGroupCode(r.getGroupCode());
        i.setName(r.getName());
        i.setContractTypeCode(r.getContractTypeCode());
        i.setSalesManagerName(r.getSalesManagerName());
        i.setBusinessTypeCode(r.getBusinessTypeCode());
        i.setStatus(r.getStatus() != null ? r.getStatus() : Institution.Status.ACTIVE);
        i.setAmlServiceTypeCode(r.getAmlServiceTypeCode());
        i.setServiceTypeCode(r.getServiceTypeCode());
        i.setBusinessNumber(r.getBusinessNumber());
        i.setCommLineType(r.getCommLineType());
        boolean needsApiKey = r.getCommLineType() == Institution.CommLineType.INTERNET
                || r.getCommLineType() == Institution.CommLineType.API
                || r.getCommLineType() == Institution.CommLineType.VPN;
        i.setApiKey(needsApiKey ? r.getApiKey() : null);
        boolean needsCommCode = r.getCommLineType() == Institution.CommLineType.DEDICATED
                || r.getCommLineType() == Institution.CommLineType.VPN;
        i.setCommInstitutionCode(needsCommCode ? r.getCommInstitutionCode() : null);
        i.setUseBalancing(Boolean.TRUE.equals(r.getUseBalancing()));
        i.setResponseTypeCode(Boolean.TRUE.equals(r.getUseBalancing()) ? r.getResponseTypeCode() : null);
        i.setUseAgentFile(Boolean.TRUE.equals(r.getUseAgentFile()));
        i.setUseAgentTxNo(Boolean.TRUE.equals(r.getUseAgentFile()) && Boolean.TRUE.equals(r.getUseAgentTxNo()));
        i.setMessageTypeCode(r.getMessageTypeCode());
        i.setTimeoutTerm(r.getTimeoutTerm());
        i.setUseDuplicateCheck(Boolean.TRUE.equals(r.getUseDuplicateCheck()));
        i.setUseMasterAccount(Boolean.TRUE.equals(r.getUseMasterAccount()));
        i.setMemo(r.getMemo());
        i.setUseValueAddedService(Boolean.TRUE.equals(r.getUseValueAddedService()));
        boolean vas = Boolean.TRUE.equals(r.getUseValueAddedService());
        i.setUseArs(vas && Boolean.TRUE.equals(r.getUseArs()));
        i.setUseOtp(vas && Boolean.TRUE.equals(r.getUseOtp()));
        i.setOtpIssueMethod(i.getUseOtp() ? r.getOtpIssueMethod() : null);
        i.setOtpValiditySeconds(i.getUseOtp() ? r.getOtpValiditySeconds() : null);
        i.setOtpDigits(i.getUseOtp() ? r.getOtpDigits() : null);
        boolean fb = Boolean.TRUE.equals(r.getUseFirmBanking());
        i.setUseFirmBanking(fb);
        // 수탁 or 재판출금 선택 시 타 서비스(일반) 불가
        boolean trust = fb && Boolean.TRUE.equals(r.getUseFbTrust());
        boolean redebit = fb && Boolean.TRUE.equals(r.getUseFbRedebit());
        boolean exclusive = trust || redebit; // 수탁 또는 재판출금 선택 시 일반 불가
        boolean general = fb && !exclusive && Boolean.TRUE.equals(r.getUseFbGeneral());
        i.setUseFbGeneral(general);
        i.setUseFbRelay(general && Boolean.TRUE.equals(r.getUseFbRelay()));
        i.setUseFbResale(general && Boolean.TRUE.equals(r.getUseFbResale()));
        i.setResaleInstitutionCode(i.getUseFbResale() ? r.getResaleInstitutionCode() : null);
        i.setResaleTypeCode(i.getUseFbResale() ? r.getResaleTypeCode() : null);
        i.setResaleMarginRate(i.getUseFbResale() ? r.getResaleMarginRate() : null);
        i.setUseFbTrust(trust);
        i.setTrustTypeCode(trust ? r.getTrustTypeCode() : null);
        i.setTrustLimitAmount(trust ? r.getTrustLimitAmount() : null);
        i.setTrustSettlementCycleCode(trust ? r.getTrustSettlementCycleCode() : null);
        i.setUseFbRedebit(redebit);
        i.setRedebitTypeCode(redebit ? r.getRedebitTypeCode() : null);
        i.setRedebitDailyLimitAmount(redebit ? r.getRedebitDailyLimitAmount() : null);
        i.setRedebitInstitutionCode(redebit ? r.getRedebitInstitutionCode() : null);
        i.setRedebitProcessTypeCode(redebit ? r.getRedebitProcessTypeCode() : null);
    }

    private void mapArsSources(InstitutionRequest r, Institution institution) {
        if (!Boolean.TRUE.equals(r.getUseArs()) || r.getArsSources() == null) return;
        List<ArsSourceRequest> sources = r.getArsSources();
        for (int idx = 0; idx < sources.size(); idx++) {
            ArsSourceRequest src = sources.get(idx);
            InstitutionArsSource entity = new InstitutionArsSource();
            entity.setInstitution(institution);
            entity.setSourceCode(src.getSourceCode());
            entity.setScenarioCode(src.getScenarioCode());
            entity.setRatio(src.getRatio());
            entity.setSortOrder(idx);
            institution.getArsSources().add(entity);
        }
    }

    private void mapRelayTargets(InstitutionRequest r, Institution institution) {
        if (!Boolean.TRUE.equals(r.getUseFbRelay()) || r.getRelayTargets() == null) return;
        List<RelayTargetRequest> targets = r.getRelayTargets();
        for (int idx = 0; idx < targets.size(); idx++) {
            RelayTargetRequest t = targets.get(idx);
            InstitutionRelayTarget entity = new InstitutionRelayTarget();
            entity.setInstitution(institution);
            entity.setBankName(t.getBankName());
            entity.setBankCode(t.getBankCode());
            entity.setSettlementCode(t.getSettlementCode());
            entity.setConversionCode(t.getConversionCode());
            entity.setSortOrder(idx);
            institution.getRelayTargets().add(entity);
        }
    }
}
