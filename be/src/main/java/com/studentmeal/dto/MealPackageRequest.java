package com.studentmeal.dto;

import com.studentmeal.entity.MealPackage;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MealPackageRequest {

    // ID của quán ăn cung cấp gói này
    private Long partnerId;

    private String name;

    private String description;

    private BigDecimal price;

    private Integer durationDays;

    private Integer mealsPerDay;

    private MealPackage.PackageType packageType;

    private String imageUrl;

    private Boolean active;
}
