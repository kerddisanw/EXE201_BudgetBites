package com.studentmeal.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CartItemDTO {
    private Long id;
    private Long menuItemId;
    private Long partnerId;
    private String itemName;
    private String dayOfWeek;
    private String mealType;
    private BigDecimal priceOriginal;
    private LocalDate orderDate;
    private Boolean withTray;
    private String partnerName;
    private LocalDateTime addedAt;
}
