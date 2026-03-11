package com.studentmeal.dto;

import lombok.Data;

/**
 * Request body cho API GET /api/orders/{id}/tracking
 * User cung cấp địa chỉ giao hàng (hoặc tọa độ GPS)
 *
 * Swagger example:
 * {
 *   "deliveryAddress": "Ký túc xá khu A, ĐHQG TP.HCM, Thủ Đức",
 *   "deliveryLat": 10.8701,
 *   "deliveryLng": 106.8031
 * }
 */
@Data
public class OrderTrackingRequest {

    /**
     * Địa chỉ giao hàng dạng text (bắt buộc nếu không có lat/lng)
     * Ví dụ: "Ký túc xá khu B, ĐHQG TP.HCM"
     */
    private String deliveryAddress;

    /**
     * Vĩ độ GPS của điểm giao hàng (tuỳ chọn – ưu tiên hơn địa chỉ text)
     * Ví dụ: 10.8701
     */
    private Double deliveryLat;

    /**
     * Kinh độ GPS của điểm giao hàng (tuỳ chọn – ưu tiên hơn địa chỉ text)
     * Ví dụ: 106.8031
     */
    private Double deliveryLng;
}
