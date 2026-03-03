package com.studentmeal.dto;

import com.studentmeal.entity.MenuItem;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class MenuItemRequest {
    private MenuItem.DayOfWeek dayOfWeek; // MONDAY ... SUNDAY
    private String mealType; // Breakfast / Lunch / Dinner
    private String itemName;
    private String imageUrl; // URL ảnh món ăn
    private Integer calories;
    private BigDecimal priceOriginal;
}
