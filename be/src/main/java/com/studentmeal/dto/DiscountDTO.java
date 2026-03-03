package com.studentmeal.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DiscountDTO {
    private Long id;
    private String code;
    private BigDecimal discountPercent;
    private LocalDate validFrom;
    private LocalDate validTo;
    private Integer maxUsage;
    private String status;
}
