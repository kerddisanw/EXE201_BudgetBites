package com.studentmeal.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class MealOrderDTO {
    private Long id;
    private Long subscriptionId;
    private Long partnerId;
    private String partnerName;
    private Long menuItemId; // ID món ăn đã chọn (null nếu không chọn)
    private String menuItemName; // Tên món ăn đã chọn
    private LocalDate orderDate;
    private String mealType;
    private Boolean withTray; // Thêm khay ăn và dụng cụ ăn (+1,000đ)
    private String status;
}
