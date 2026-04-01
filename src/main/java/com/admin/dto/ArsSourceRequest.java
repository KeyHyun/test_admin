package com.admin.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ArsSourceRequest {

    @NotBlank
    private String sourceCode;      // 원천사 코드

    @NotBlank
    private String scenarioCode;    // 시나리오 코드

    @NotNull
    @Min(1) @Max(100)
    private Integer ratio;          // 비율 (%)

    private Integer sortOrder = 0;
}
