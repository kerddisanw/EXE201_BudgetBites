package com.studentmeal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Response DTO cho API GET /api/orders/{id}/tracking
 * Trả về thông tin đơn hàng + tọa độ quán + route từ quán → user
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderTrackingDTO {

    // ── Thông tin đơn hàng ─────────────────────────────────────
    private Long orderId;
    private String status;          // PENDING | PREPARING | DELIVERED | CANCELLED
    private LocalDate orderDate;
    private String mealType;        // Breakfast / Lunch / Dinner

    // ── Thông tin quán ăn (điểm xuất phát) ─────────────────────
    private Long partnerId;
    private String partnerName;
    private String partnerAddress;
    private Double partnerLat;      // vĩ độ quán
    private Double partnerLng;      // kinh độ quán

    // ── Thông tin user (điểm đến) ───────────────────────────────
    private String deliveryAddress; // địa chỉ giao hàng user nhập
    private Double deliveryLat;     // vĩ độ điểm giao
    private Double deliveryLng;     // kinh độ điểm giao

    // ── Kết quả từ Google Maps Distance Matrix API ──────────────
    private String distanceText;    // "2.3 km"
    private Integer distanceMeters;
    private String durationText;    // "8 mins"
    private Integer durationSeconds;

    // ── Google Maps Directions embed URL ────────────────────────
    private String googleMapsUrl;   // Link mở Google Maps chỉ đường
    private String embedMapUrl;     // Link nhúng bản đồ vào WebView

    // ── Thông điệp trạng thái hiển thị cho user ─────────────────
    private String statusMessage;   // "Quán đang chuẩn bị đơn của bạn..."
}
