package com.studentmeal.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MenuItemDTO {
    private Long id;
    private String mealType;
    private String itemName;
    private Integer calories;
    private BigDecimal priceOriginal;
}
