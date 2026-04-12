package com.studentmeal.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DiscountUpdateRequest {

    private String code;

    private BigDecimal discountPercent;

    private LocalDate validFrom;

    private LocalDate validTo;

    private Integer maxUsage;

    /** ACTIVE, INACTIVE, EXPIRED */
    private String status;
}
