package com.admin.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "institution_relay_targets")
@Getter
@Setter
@NoArgsConstructor
public class InstitutionRelayTarget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(length = 100)
    private String bankName;           // 은행

    @Column(length = 20)
    private String bankCode;           // 은행 기관코드

    @Column(length = 20)
    private String settlementCode;     // 금결원 기관코드

    @Column(length = 20)
    private String conversionCode;     // 변환 기관코드

    @Column(nullable = false)
    private Integer sortOrder = 0;
}
