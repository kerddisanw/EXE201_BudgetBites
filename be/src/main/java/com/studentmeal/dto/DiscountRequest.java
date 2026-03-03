package com.studentmeal.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DiscountRequest {

    private String code; // Mã giảm giá (ví dụ: "SV_MOI")

    private BigDecimal discountPercent; // Phần trăm giảm (ví dụ: 10.0)

    private LocalDate validFrom; // Ngày bắt đầu hiệu lực

    private LocalDate validTo; // Ngày hết hiệu lực

    private Integer maxUsage; // Số lần dùng tối đa

    // id → tự sinh
    // status → mặc định "ACTIVE" khi tạo
}
