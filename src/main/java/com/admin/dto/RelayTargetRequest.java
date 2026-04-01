package com.admin.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RelayTargetRequest {
    private String bankName;       // 은행
    private String bankCode;       // 은행 기관코드
    private String settlementCode; // 금결원 기관코드
    private String conversionCode; // 변환 기관코드
    private Integer sortOrder = 0;
}
