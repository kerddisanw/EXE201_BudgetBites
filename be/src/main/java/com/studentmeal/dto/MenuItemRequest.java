package com.studentmeal.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MenuItemRequest {

    // id không cần thiết – tự sinh
    private String mealType; // Ví dụ: "Lunch", "Dinner", "Breakfast"

    private String itemName; // Tên món ăn

    private Integer calories; // Lượng calo (có thể null)

    private BigDecimal priceOriginal; // Giá gốc (VNĐ)
}
