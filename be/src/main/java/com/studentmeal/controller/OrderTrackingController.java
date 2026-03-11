package com.studentmeal.controller;

import com.studentmeal.dto.OrderTrackingDTO;
import com.studentmeal.dto.OrderTrackingRequest;
import com.studentmeal.service.OrderTrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Order Tracking", description = "Theo dõi đơn hàng với Google Maps")
public class OrderTrackingController {

    private final OrderTrackingService orderTrackingService;

    /**
     * GET /api/orders/{id}/tracking
     *
     * Lấy thông tin tracking đơn hàng:
     * - Trạng thái đơn hàng
     * - Thông tin quán ăn (vị trí xuất phát)
     * - Khoảng cách & thời gian giao hàng (Google Distance Matrix)
     * - Link chỉ đường Google Maps
     *
     * Request body:
     * {
     *   "deliveryAddress": "Ký túc xá khu A, ĐHQG TP.HCM, Thủ Đức",
     *   "deliveryLat": 10.8701,    (optional - nếu có sẽ ưu tiên hơn address)
     *   "deliveryLng": 106.8031    (optional)
     * }
     */
    @PostMapping("/{id}/tracking")
    @Operation(
        summary = "Theo dõi đơn hàng với Google Maps",
        description = """
            Trả về thông tin tracking đơn hàng gồm:
            - Trạng thái đơn hàng hiện tại
            - Tọa độ quán ăn (điểm xuất phát)
            - Khoảng cách và thời gian giao hàng (từ Google Distance Matrix API)
            - URL chỉ đường trên Google Maps
            - URL nhúng bản đồ (cho mobile WebView)
            
            **Cách dùng:**
            - Cung cấp `deliveryAddress` (địa chỉ text) **hoặc** `deliveryLat` + `deliveryLng` (tọa độ GPS)
            - Nếu có cả 2, tọa độ GPS sẽ được ưu tiên
            """,
        requestBody = @RequestBody(
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = OrderTrackingRequest.class),
                examples = {
                    @ExampleObject(
                        name = "Dùng địa chỉ text",
                        value = """
                            {
                              "deliveryAddress": "Ký túc xá khu A, ĐHQG TP.HCM, Thủ Đức, TP.HCM"
                            }
                            """
                    ),
                    @ExampleObject(
                        name = "Dùng tọa độ GPS",
                        value = """
                            {
                              "deliveryLat": 10.8701,
                              "deliveryLng": 106.8031
                            }
                            """
                    ),
                    @ExampleObject(
                        name = "Dùng cả hai (GPS ưu tiên)",
                        value = """
                            {
                              "deliveryAddress": "Ký túc xá khu A, ĐHQG TP.HCM",
                              "deliveryLat": 10.8701,
                              "deliveryLng": 106.8031
                            }
                            """
                    )
                }
            )
        )
    )
    public ResponseEntity<OrderTrackingDTO> trackOrder(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestBody OrderTrackingRequest request) {
        return ResponseEntity.ok(orderTrackingService.getOrderTracking(id, request));
    }
}
