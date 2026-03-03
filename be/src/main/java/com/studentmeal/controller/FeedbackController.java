package com.studentmeal.controller;

import com.studentmeal.dto.FeedbackDTO;
import com.studentmeal.dto.FeedbackRequest;
import com.studentmeal.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @GetMapping("/partner/{partnerId}")
    public ResponseEntity<List<FeedbackDTO>> getFeedbacksByPartner(@PathVariable Long partnerId) {
        return ResponseEntity.ok(feedbackService.getFeedbacksByPartner(partnerId));
    }

    @PostMapping
    public ResponseEntity<FeedbackDTO> createFeedback(@RequestBody FeedbackRequest request) {
        return ResponseEntity.ok(feedbackService.createFeedback(request));
    }
}
