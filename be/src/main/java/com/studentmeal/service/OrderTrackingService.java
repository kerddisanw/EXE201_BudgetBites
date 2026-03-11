package com.studentmeal.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studentmeal.dto.OrderTrackingDTO;
import com.studentmeal.dto.OrderTrackingRequest;
import com.studentmeal.entity.MealOrder;
import com.studentmeal.entity.MealPartner;
import com.studentmeal.exception.ResourceNotFoundException;
import com.studentmeal.repository.MealOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderTrackingService {

    private final MealOrderRepository mealOrderRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${google.maps.api-key:YOUR_GOOGLE_MAPS_API_KEY}")
    private String googleMapsApiKey;

    /**
     * Lấy thông tin tracking đơn hàng:
     * - Thông tin order + partner (điểm xuất phát)
     * - Gọi Google Maps Distance Matrix API để tính khoảng cách & thời gian
     * - Trả về URL Google Maps chỉ đường
     */
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public OrderTrackingDTO getOrderTracking(Long orderId, OrderTrackingRequest request) {
        // 1. Tìm đơn hàng
        MealOrder order = mealOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        MealPartner partner = order.getPartner();
        if (partner == null) {
            throw new ResourceNotFoundException("Order " + orderId + " has no partner assigned.");
        }

        // 2. Xác định tọa độ điểm giao hàng
        Double destLat = request.getDeliveryLat();
        Double destLng = request.getDeliveryLng();
        String deliveryAddress = request.getDeliveryAddress();

        // Nếu user cung cấp địa chỉ text thay vì tọa độ → Geocode địa chỉ
        if ((destLat == null || destLng == null) && deliveryAddress != null) {
            double[] coords = geocodeAddress(deliveryAddress);
            destLat = coords[0];
            destLng = coords[1];
        }

        // 3. Tọa độ quán (điểm xuất phát) - dùng giá trị mặc định nếu chưa có trong DB
        Double partnerLat = partner.getLatitude() != null ? partner.getLatitude() : 10.7769;
        Double partnerLng = partner.getLongitude() != null ? partner.getLongitude() : 106.7009;

        // 4. Gọi Google Distance Matrix API
        DistanceInfo distanceInfo = null;
        if (destLat != null && destLng != null) {
            distanceInfo = callDistanceMatrixApi(partnerLat, partnerLng, destLat, destLng);
        }

        // 5. Tạo Google Maps URL chỉ đường
        String mapsUrl = buildGoogleMapsUrl(partnerLat, partnerLng, destLat, destLng, deliveryAddress);

        // 6. Tạo embed URL cho WebView/iframe
        String embedUrl = buildEmbedMapUrl(partnerLat, partnerLng, destLat, destLng);

        // 7. Tạo thông điệp trạng thái
        String statusMessage = buildStatusMessage(order.getStatus());

        return OrderTrackingDTO.builder()
                .orderId(order.getId())
                .status(order.getStatus().name())
                .orderDate(order.getOrderDate())
                .mealType(order.getMealType())
                // Partner info
                .partnerId(partner.getId())
                .partnerName(partner.getName())
                .partnerAddress(partner.getAddress())
                .partnerLat(partnerLat)
                .partnerLng(partnerLng)
                // Delivery info
                .deliveryAddress(deliveryAddress)
                .deliveryLat(destLat)
                .deliveryLng(destLng)
                // Distance Matrix
                .distanceText(distanceInfo != null ? distanceInfo.distanceText : null)
                .distanceMeters(distanceInfo != null ? distanceInfo.distanceMeters : null)
                .durationText(distanceInfo != null ? distanceInfo.durationText : null)
                .durationSeconds(distanceInfo != null ? distanceInfo.durationSeconds : null)
                // Map URLs
                .googleMapsUrl(mapsUrl)
                .embedMapUrl(embedUrl)
                .statusMessage(statusMessage)
                .build();
    }

    /**
     * Geocode địa chỉ text → tọa độ lat/lng
     * Dùng Google Geocoding API
     */
    private double[] geocodeAddress(String address) {
        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl("https://maps.googleapis.com/maps/api/geocode/json")
                    .queryParam("address", address)
                    .queryParam("key", googleMapsApiKey)
                    .build()
                    .toUriString();

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode location = root
                    .path("results").get(0)
                    .path("geometry")
                    .path("location");

            return new double[]{
                    location.path("lat").asDouble(),
                    location.path("lng").asDouble()
            };
        } catch (Exception e) {
            log.warn("Geocoding failed for address '{}': {}", address, e.getMessage());
            // Trả về tọa độ mặc định TP.HCM khi geocode thất bại
            return new double[]{10.7769, 106.7009};
        }
    }

    /**
     * Gọi Google Distance Matrix API
     * Tính khoảng cách và thời gian đi xe từ quán → user
     */
    private DistanceInfo callDistanceMatrixApi(
            Double originLat, Double originLng,
            Double destLat, Double destLng) {
        try {
            String origins = originLat + "," + originLng;
            String destinations = destLat + "," + destLng;

            String url = UriComponentsBuilder
                    .fromHttpUrl("https://maps.googleapis.com/maps/api/distancematrix/json")
                    .queryParam("origins", origins)
                    .queryParam("destinations", destinations)
                    .queryParam("mode", "driving")
                    .queryParam("language", "vi")
                    .queryParam("key", googleMapsApiKey)
                    .build()
                    .toUriString();

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);

            JsonNode element = root
                    .path("rows").get(0)
                    .path("elements").get(0);

            if (!"OK".equals(element.path("status").asText())) {
                log.warn("Distance Matrix returned non-OK status: {}", element.path("status").asText());
                return null;
            }

            DistanceInfo info = new DistanceInfo();
            info.distanceText = element.path("distance").path("text").asText();
            info.distanceMeters = element.path("distance").path("value").asInt();
            info.durationText = element.path("duration").path("text").asText();
            info.durationSeconds = element.path("duration").path("value").asInt();
            return info;

        } catch (Exception e) {
            log.error("Distance Matrix API call failed: {}", e.getMessage());
            return null;
        }
    }

    /** Tạo link mở Google Maps app/web chỉ đường từ quán → điểm giao */
    private String buildGoogleMapsUrl(
            Double originLat, Double originLng,
            Double destLat, Double destLng,
            String destAddress) {

        String destination = (destLat != null && destLng != null)
                ? destLat + "," + destLng
                : (destAddress != null ? destAddress : "");

        return "https://www.google.com/maps/dir/" + originLat + "," + originLng
                + "/" + destination + "/@" + originLat + "," + originLng + ",14z";
    }

    /** Tạo embed URL nhúng bản đồ vào WebView (cho mobile) */
    private String buildEmbedMapUrl(
            Double originLat, Double originLng,
            Double destLat, Double destLng) {

        if (destLat == null || destLng == null) {
            return "https://www.google.com/maps/embed/v1/place?key=" + googleMapsApiKey
                    + "&q=" + originLat + "," + originLng;
        }

        return "https://www.google.com/maps/embed/v1/directions?key=" + googleMapsApiKey
                + "&origin=" + originLat + "," + originLng
                + "&destination=" + destLat + "," + destLng
                + "&mode=driving";
    }

    /** Thông điệp trạng thái thân thiện cho user */
    private String buildStatusMessage(MealOrder.OrderStatus status) {
        return switch (status) {
            case PENDING -> "⏳ Đơn hàng đang chờ quán xác nhận...";
            case PREPARING -> "👨‍🍳 Quán đang chuẩn bị bữa ăn của bạn!";
            case DELIVERED -> "✅ Đơn hàng đã được giao thành công!";
            case CANCELLED -> "❌ Đơn hàng đã bị hủy.";
        };
    }

    /** Inner class giữ kết quả từ Distance Matrix API */
    private static class DistanceInfo {
        String distanceText;
        Integer distanceMeters;
        String durationText;
        Integer durationSeconds;
    }
}
