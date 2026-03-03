package com.studentmeal.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class WeeklyMenuRequest {

    // id không cần thiết – tự sinh
    // partnerName không cần thiết trong request – chỉ cần partnerId
    private Long partnerId;

    private LocalDate weekStartDate; // Ngày bắt đầu tuần (yyyy-MM-dd)

    private String description; // Mô tả thực đơn tuần (ví dụ: "Thực đơn tuần 1 tháng 3")

    private List<MenuItemRequest> items; // Danh sách các món ăn trong tuần
}
