package com.studentmeal.controller;

import com.studentmeal.dto.ChatRequest;
import com.studentmeal.dto.ChatResponse;
import com.studentmeal.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST endpoint for the BudgetBites AI Chatbot.
 *
 * POST /api/chatbot
 * Body: { "userId": 1, "message": "I have 300k budget, what should I eat?" }
 */
@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Chatbot", description = "AI Meal Assistant – budget advice, menu queries, subscription support")
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    @Operation(
        summary = "Send a message to the Meal Assistant",
        description = """
            Accepts a user message and returns a context-aware reply.
            
            **Supported intents:**
            - Budget meal recommendation: *"I have 300k, what should I eat?"*
            - Nutrition advice: *"Suggest a healthy low-calorie meal"*
            - Menu query: *"What will I eat this week?"*
            - Subscription info: *"Check my subscription status"*
            - Today's order: *"What am I eating today?"*
            """
    )
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        ChatResponse response = chatService.handleMessage(request);
        return ResponseEntity.ok(response);
    }
}
