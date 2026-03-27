package com.studentmeal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FeedbackEligibilityDTO {
    private boolean eligible;
    private String message;
}
