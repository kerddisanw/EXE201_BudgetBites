package com.studentmeal.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CartAddRequest {
    private Long menuItemId; // Món ăn muốn thêm vào giỏ
    private LocalDate orderDate; // Ngày muốn ăn
    private Boolean withTray; // Thêm khay ăn và dụng cụ ăn (+1,000đ)? Mặc định false
}
