package com.studentmeal.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MealPartnerResponse {

    private Long id;

    private String name;

    private String description;

    private String address;

    private String phoneNumber;

    private String email;

    private Boolean active;

    private BigDecimal discountRate;

    private Boolean status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
