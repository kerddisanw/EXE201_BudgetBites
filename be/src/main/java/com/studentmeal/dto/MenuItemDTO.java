package com.studentmeal.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MenuItemDTO {
    private Long id;
    private String dayOfWeek; // MONDAY ... SUNDAY
    private String mealType; // Breakfast / Lunch / Dinner
    private String itemName;
    private String imageUrl; // Ảnh món ăn
    private Integer calories;
    private BigDecimal priceOriginal;
}
