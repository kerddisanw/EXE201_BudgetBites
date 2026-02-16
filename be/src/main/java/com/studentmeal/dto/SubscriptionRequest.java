package com.studentmeal.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionRequest {

    @NotNull(message = "Package ID is required")
    private Long packageId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private String notes;
}
