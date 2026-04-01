package com.admin.config;

import com.admin.entity.Institution;
import com.admin.entity.InstitutionRelayTarget;
import com.admin.entity.User;
import com.admin.repository.InstitutionRepository;
import com.admin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final InstitutionRepository institutionRepository;

    @Override
    public void run(ApplicationArguments args) {
        createAdminUser();
        createSampleInstitution();
    }

    private void createAdminUser() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin1234"));
            admin.setName("\uad00\ub9ac\uc790");
            admin.setEmail("admin@admin.com");
            admin.setRole(User.Role.SUPER_ADMIN);
            admin.setEnabled(true);
            userRepository.save(admin);
            log.info("기본 관리자 계정 생성 완료 (admin / admin1234)");
        }
    }

    private void createSampleInstitution() {
        if (!institutionRepository.existsByCode("KBKR01")) {
            Institution inst = new Institution();
            inst.setCode("KBKR01");
            inst.setGroupCode("KBGRP");
            inst.setName("\uad6d\ubbfc\uc740\ud589");
            inst.setContractTypeCode("ENTERPRISE");
            inst.setSalesManagerName("\uae40\ucca0\uc218");
            inst.setBusinessTypeCode("BANK");
            inst.setStatus(Institution.Status.ACTIVE);
            inst.setAmlServiceTypeCode("BASIC");
            inst.setServiceTypeCode("FULL");
            inst.setBusinessNumber("204-81-12030");
            inst.setCommLineType(Institution.CommLineType.API);
            inst.setApiKey("kb-api-key-a1b2c3d4e5f6g7h8i9j0");
            inst.setUseBalancing(true);
            inst.setResponseTypeCode("SYNC");
            inst.setMessageTypeCode("JSON");
            inst.setTimeoutTerm(30000);
            inst.setUseAgentFile(false);
            inst.setUseAgentTxNo(false);
            inst.setUseDuplicateCheck(true);
            inst.setUseMasterAccount(true);
            inst.setMemo("\uad6d\ubbfc\uc740\ud589 \uae30\uc5c5 \uacc4\uc57d \uae30\uad00. AML \uae30\ubcf8 \uc11c\ube44\uc2a4 \uc801\uc6a9, API \ubc29\uc2dd \ud1b5\uc2e0.");
            inst.setUseValueAddedService(true);
            inst.setUseFirmBanking(true);
            inst.setUseFbGeneral(true);
            inst.setUseFbRelay(true);
            InstitutionRelayTarget relayTarget = new InstitutionRelayTarget();
            relayTarget.setInstitution(inst);
            relayTarget.setBankName("국민은행");
            relayTarget.setBankCode("KBKR01");
            relayTarget.setSettlementCode("KFTC01");
            relayTarget.setConversionCode("CONV01");
            relayTarget.setSortOrder(0);
            inst.getRelayTargets().add(relayTarget);
            institutionRepository.save(inst);
            log.info("샘플 기관 데이터 생성 완료 (국민은행)");
        }
    }
}
