package com.admin.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "institution_ars_sources")
@Getter
@Setter
@NoArgsConstructor
public class InstitutionArsSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(nullable = false, length = 20)
    private String sourceCode;      // 원천사 코드

    @Column(nullable = false, length = 50)
    private String scenarioCode;    // 시나리오 코드

    @Column(nullable = false)
    private Integer ratio;          // 비율 (%)

    @Column(nullable = false)
    private Integer sortOrder = 0;
}
