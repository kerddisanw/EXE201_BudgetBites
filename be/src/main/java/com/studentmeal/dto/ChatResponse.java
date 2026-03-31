package com.studentmeal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {

    /** The reply text shown to the user. */
    private String reply;

    /** Meal packages suggested by the chatbot (may be empty). */
    private List<MealPackageDTO> suggestedPackages;

    /** Action buttons the frontend can render (e.g. "VIEW_PACKAGE", "SUBSCRIBE"). */
    private List<String> actions;

    /** Detected intent of the user's message. */
    private String detectedIntent;
}
