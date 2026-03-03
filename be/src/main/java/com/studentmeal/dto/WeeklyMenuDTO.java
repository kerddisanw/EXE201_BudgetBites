package com.studentmeal.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WeeklyMenuDTO {
    private Long id;
    private Long partnerId;
    private String partnerName;
    private LocalDate weekStartDate;
    private String description;
    private List<MenuItemDTO> items;
    private LocalDateTime createdAt;
}
