package com.studentmeal.dto;

import com.studentmeal.entity.MealPackage;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MealPackageRequest {

    private String name;

    private String description;

    private BigDecimal price;

    private Integer durationDays;

    private Integer mealsPerDay;

    private MealPackage.PackageType packageType;

    // Chỉ giữ partnerId thay vì cả object partner
    private Long partnerId;

    private String imageUrl;

    private Boolean active;
}
