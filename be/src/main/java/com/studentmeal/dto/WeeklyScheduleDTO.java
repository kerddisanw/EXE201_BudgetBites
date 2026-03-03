package com.studentmeal.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * Response cho API GET /api/menus/partner/{id}/schedule
 * Trả về lịch thực đơn tuần đã nhóm theo ngày → buổi ăn → danh sách món
 *
 * Ví dụ:
 * {
 * "partnerId": 1,
 * "partnerName": "Cơm Tấm Sài Gòn",
 * "weekStartDate": "2026-03-02",
 * "schedule": {
 * "MONDAY": {
 * "Lunch": [ { id, itemName, imageUrl, priceOriginal }, ... ],
 * "Dinner": [ { id, itemName, imageUrl, priceOriginal }, ... ]
 * },
 * "WEDNESDAY": { ... }
 * }
 * }
 */
@Data
public class WeeklyScheduleDTO {
    private Long partnerId;
    private String partnerName;
    private String weekStartDate; // "2026-03-02"
    private Long menuId;

    // Key: "MONDAY", "TUESDAY", ...
    // Value: Map của mealType → list món
    // Key: "Lunch", "Dinner", "Breakfast"
    // Value: list MenuItemDTO
    private Map<String, Map<String, List<MenuItemDTO>>> schedule;
}
