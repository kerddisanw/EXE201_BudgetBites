package com.studentmeal.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studentmeal.config.PayOSConfig;
import com.studentmeal.entity.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Service
@RequiredArgsConstructor
public class PayOSService {

    private final PayOSConfig payOSConfig;
    private final PayOsOrderCodeSequence payOsOrderCodeSequence;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    public record PayOSCheckoutResponse(String checkoutUrl, String orderCode) {}
    public record PayOSWebhookResult(String orderCode, boolean paymentSuccess) {}

    /**
     * Creates a PayOS payment request. {@code orderCode} comes from a DB sequence (not {@code payment.id}) so PayOS
     * never sees reused low ids; the sequence is unique across restarts and multiple app instances.
     */
    public PayOSCheckoutResponse createCheckout(Payment payment) {
        try {
            validatePayOsConfig();
            int orderCodeInt = payOsOrderCodeSequence.nextOrderCode();
            return postPaymentRequest(payment, orderCodeInt);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create PayOS checkout: " + e.getMessage(), e);
        }
    }

    private void validatePayOsConfig() {
        if (payOSConfig.getClientId() == null || payOSConfig.getClientId().isBlank()
                || payOSConfig.getApiKey() == null || payOSConfig.getApiKey().isBlank()
                || payOSConfig.getChecksumKey() == null || payOSConfig.getChecksumKey().isBlank()) {
            throw new IllegalStateException(
                    "PayOS is not configured (set PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY on the server)");
        }
        if (payOSConfig.getReturnUrl() == null || payOSConfig.getReturnUrl().isBlank()
                || payOSConfig.getCancelUrl() == null || payOSConfig.getCancelUrl().isBlank()) {
            throw new IllegalStateException(
                    "PayOS return/cancel URLs missing (set payos.return-url / payos.cancel-url or FRONTEND_BASE_URL)");
        }
    }

    private PayOSCheckoutResponse postPaymentRequest(Payment payment, int orderCodeInt) throws Exception {
        String orderCode = String.valueOf(orderCodeInt);

        Map<String, Object> body = new HashMap<>();
        body.put("orderCode", orderCodeInt);
        body.put("amount", toMinorUnits(payment.getAmount()));
        // With non-linked bank accounts, description length may be limited.
        body.put("description", "BudgetB");
        body.put("returnUrl", payOSConfig.getReturnUrl());
        body.put("cancelUrl", payOSConfig.getCancelUrl());

        String signature = signPaymentRequest(body);
        body.put("signature", signature);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-client-id", payOSConfig.getClientId());
        headers.set("x-api-key", payOSConfig.getApiKey());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        String url = payOSConfig.getBaseUrl().replaceAll("/+$", "") + "/v2/payment-requests";

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            String responseBody = response.getBody();
            throw new IllegalStateException(
                    "PayOS HTTP " + response.getStatusCode() + (responseBody != null ? ": " + responseBody : ""));
        }

        JsonNode root = objectMapper.readTree(response.getBody());
        assertPayOsBusinessSuccess(root);

        JsonNode dataNode = root.path("data");
        String checkoutUrl = dataNode.path("checkoutUrl").asText(null);

        if (checkoutUrl == null || checkoutUrl.isBlank()) {
            throw new IllegalStateException("PayOS response missing checkoutUrl: " + response.getBody());
        }

        return new PayOSCheckoutResponse(checkoutUrl, orderCode);
    }

    /**
     * PayOS returns HTTP 200 with a business {@code code}; success is usually {@code "00"} or {@code 0}.
     */
    private static void assertPayOsBusinessSuccess(JsonNode root) {
        if (!root.has("code") || root.get("code").isNull()) {
            return;
        }
        JsonNode codeNode = root.get("code");
        boolean ok =
                (codeNode.isTextual() && "00".equals(codeNode.asText()))
                        || (codeNode.isNumber() && codeNode.asInt() == 0);
        if (ok) {
            return;
        }
        String desc = root.path("desc").asText(root.path("message").asText("Payment request rejected"));
        throw new IllegalStateException("PayOS API: " + desc + " (code=" + codeNode + ")");
    }

    /** Whole VND (PayOS amount is an integer). DB may store scale 2 — round safely. */
    private long toMinorUnits(BigDecimal amount) {
        if (amount == null) {
            throw new IllegalArgumentException("Payment amount is null");
        }
        return amount.setScale(0, RoundingMode.HALF_UP).longValueExact();
    }

    private String signPaymentRequest(Map<String, Object> body) throws Exception {
        // payOS vn payment-requests signature uses these fields:
        // amount, cancelUrl, description, orderCode, returnUrl
        // and formats them as: amount=$amount&cancelUrl=$cancelUrl&description=$description&orderCode=$orderCode&returnUrl=$returnUrl
        long amount = ((Number) body.get("amount")).longValue();
        String cancelUrl = String.valueOf(body.get("cancelUrl"));
        String description = String.valueOf(body.get("description"));
        int orderCode = ((Number) body.get("orderCode")).intValue();
        String returnUrl = String.valueOf(body.get("returnUrl"));

        String signatureData = "amount=" + amount +
                "&cancelUrl=" + cancelUrl +
                "&description=" + description +
                "&orderCode=" + orderCode +
                "&returnUrl=" + returnUrl;

        return hmacSha256Hex(signatureData, payOSConfig.getChecksumKey());
    }

    private String hmacSha256Hex(String data, String secret) throws Exception {
        Mac hmac = Mac.getInstance("HmacSHA256");
        hmac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    public PayOSWebhookResult verifyPaymentWebhook(JsonNode webhookPayload) {
        try {
            String providedSignature = webhookPayload.path("signature").asText("");
            JsonNode dataNode = webhookPayload.path("data");
            if (providedSignature.isBlank() || dataNode.isMissingNode() || dataNode.isNull()) {
                throw new IllegalArgumentException("Missing signature or data in webhook");
            }

            String computed = computeWebhookSignature(dataNode);
            if (!computed.equalsIgnoreCase(providedSignature)) {
                throw new SecurityException("PayOS webhook signature mismatch");
            }

            boolean successFlag = webhookPayload.path("success").asBoolean(false);
            String innerCode = dataNode.path("code").asText("");
            boolean paymentSuccess = successFlag || "00".equals(innerCode);

            // webhook data.orderCode is numeric; convert to string for lookup
            String orderCode = String.valueOf(dataNode.path("orderCode").asText());
            return new PayOSWebhookResult(orderCode, paymentSuccess);
        } catch (Exception e) {
            throw new RuntimeException("Invalid PayOS webhook", e);
        }
    }

    private String computeWebhookSignature(JsonNode dataNode) throws Exception {
        // signature verifies webhookData['data'] sorted by key, as key=value&key2=value2
        Iterator<String> fieldNames = dataNode.fieldNames();
        ArrayList<String> keys = new ArrayList<>();
        while (fieldNames.hasNext()) {
            keys.add(fieldNames.next());
        }
        Collections.sort(keys);

        StringBuilder query = new StringBuilder();
        for (int i = 0; i < keys.size(); i++) {
            String key = keys.get(i);
            JsonNode v = dataNode.path(key);

            String value;
            if (v.isNull() || v.isMissingNode()) {
                value = "";
            } else if (v.isTextual()) {
                value = v.asText("");
            } else {
                value = v.toString();
            }

            query.append(key).append("=").append(value);
            // Note: payOS signing for payment-requests/webhook uses raw values (no URL encoding).
            // If signature mismatches, remove/adjust encoding logic here.
            if (i < keys.size() - 1) {
                query.append("&");
            }
        }

        return hmacSha256Hex(query.toString(), payOSConfig.getChecksumKey());
    }
}

