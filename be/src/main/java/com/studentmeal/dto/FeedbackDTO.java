package com.studentmeal.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FeedbackDTO {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long partnerId;
    private String partnerName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
