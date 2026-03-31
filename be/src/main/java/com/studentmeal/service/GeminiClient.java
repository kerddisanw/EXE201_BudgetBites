package com.studentmeal.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.studentmeal.dto.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

/**
 * Client for Google Gemini AI API.
 * Returns null (falls back to rule engine) when:
 *   - gemini.api-key is blank / not set
 *   - any network / API error occurs
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiClient {

    // Using Gemini 1.5 Flash for speed and efficiency
    private static final String API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=%s";

    @Value("${gemini.api-key:}")
    private String apiKey;

    private final ObjectMapper objectMapper;
    private final HttpClient   httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * @param systemPrompt  Business context injected as system instruction
     * @param history       Last N user/assistant messages for context
     * @param userMessage   The latest user input
     * @return AI-generated reply, or null if AI is unavailable
     */
    public String chat(String systemPrompt, List<ChatMessage> history, String userMessage) {
        if (apiKey == null || apiKey.isBlank()) {
            log.debug("Gemini API key not configured – using rule-based fallback");
            return null;
        }

        try {
            ObjectNode root = objectMapper.createObjectNode();
            ArrayNode contents = root.putArray("contents");

            // Combine system prompt and history into contents
            // Note: Gemini expects strictly alternating roles (user, model, user, model)
            // We'll prepend the system instruction to the first user message or as a separate 'user' entry.
            
            // 1. Add context entry
            ObjectNode systemEntry = contents.addObject();
            systemEntry.put("role", "user");
            systemEntry.putArray("parts").addObject().put("text", "System Instruction: " + systemPrompt);
            
            ObjectNode sysAck = contents.addObject();
            sysAck.put("role", "model");
            sysAck.putArray("parts").addObject().put("text", "Understood. I will act as the Student Meal Combo AI Assistant in Vietnamese.");

            // 2. Add history
            for (ChatMessage msg : history) {
                ObjectNode content = contents.addObject();
                content.put("role", "assistant".equals(msg.getRole()) ? "model" : "user");
                content.putArray("parts").addObject().put("text", msg.getContent());
            }

            // 3. Add current message
            ObjectNode currentMsg = contents.addObject();
            currentMsg.put("role", "user");
            currentMsg.putArray("parts").addObject().put("text", userMessage);

            // 4. Generation Config
            ObjectNode generationConfig = root.putObject("generationConfig");
            generationConfig.put("temperature", 0.7);
            generationConfig.put("maxOutputTokens", 1024);

            String requestBody = objectMapper.writeValueAsString(root);
            String url = String.format(API_URL_TEMPLATE, apiKey);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(60))
                    .build();

            HttpResponse<String> response = httpClient.send(request,
                    HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Gemini API Error ({}): {}", response.statusCode(), response.body());
                return null;
            }

            JsonNode responseJson = objectMapper.readTree(response.body());
            
            // Log response if text is missing
            JsonNode textNode = responseJson.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            if (textNode.isMissingNode()) {
                log.warn("Gemini response missing text part. Full response: {}", response.body());
                return null;
            }

            return textNode.asText();

        } catch (Exception ex) {
            log.error("Gemini invocation failed", ex);
            return null;
        }
    }
}
