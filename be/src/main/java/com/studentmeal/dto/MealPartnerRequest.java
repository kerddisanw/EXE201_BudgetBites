package com.studentmeal.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MealPartnerRequest {

    private String name;

    private String description;

    private String address;

    private String phoneNumber;

    private String email;

    private BigDecimal discountRate;

    private String imageUrl;

    private Double latitude;

    private Double longitude;
}
