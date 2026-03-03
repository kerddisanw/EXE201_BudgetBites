package com.studentmeal.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class MealOrderDTO {
    private Long id;
    private Long subscriptionId;
    private Long partnerId;
    private String partnerName;
    private LocalDate orderDate;
    private String mealType;
    private String status;
}
