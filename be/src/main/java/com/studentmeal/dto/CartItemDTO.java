package com.studentmeal.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CartItemDTO {
    private Long id;
    private Long menuItemId;
    private String itemName;
    private String dayOfWeek;
    private String mealType;
    private BigDecimal priceOriginal;
    private LocalDate orderDate; // Ngày user muốn ăn
    private Boolean withTray; // Thêm khay ăn và dụng cụ ăn (+1,000đ)?
    private Long partnerId;
    private String partnerName;
    private LocalDateTime addedAt;
}
