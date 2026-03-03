package com.studentmeal.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class MealOrderRequest {

    private Long subscriptionId; // ID subscription đang active

    private Long partnerId; // ID partner cung cấp bữa ăn

    private Long menuItemId; // ID món ăn cụ thể từ WeeklyMenu (optional)

    private LocalDate orderDate; // Ngày đặt bữa (yyyy-MM-dd)

    private String mealType; // "Breakfast", "Lunch", "Dinner"

    // id → tự sinh
    // partnerName → server tự lookup từ partnerId
    // status → mặc định "PENDING" khi tạo
}
