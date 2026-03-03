package com.studentmeal.dto;

import lombok.Data;

@Data
public class FeedbackRequest {

    private Long partnerId; // ID của partner được đánh giá

    private Integer rating; // Điểm đánh giá (1-5)

    private String comment; // Nội dung nhận xét

    // customerId → tự lấy từ token JWT (user đang đăng nhập)
    // customerName, partnerName, id, createdAt → server tự xử lý
}
