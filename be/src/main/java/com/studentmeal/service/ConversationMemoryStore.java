package com.studentmeal.service;

import com.studentmeal.dto.ChatMessage;
import com.studentmeal.entity.ChatHistory;
import com.studentmeal.repository.ChatHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Conversation context store using PostgreSQL for persistence.
 * Keeps relevant Turn history for a seamless AI experience.
 */
@Component
@RequiredArgsConstructor
public class ConversationMemoryStore {

    private final ChatHistoryRepository repository;
    private static final int MAX_TURNS = 3; // Keep last 3 user-assistant pairs

    /**
     * Retrieve a snapshot of the recent conversation history for a user,
     * ordered CHRONOLOGICALLY for the AI.
     */
    @Transactional(readOnly = true)
    public List<ChatMessage> getHistory(Long userId) {
        // Fetch last 6 (MAX_TURNS * 2) messages, then reverse order to be chronological
        List<ChatHistory> recent = repository.findByUserIdOrderByTimestampDesc(
                userId, PageRequest.of(0, MAX_TURNS * 2));
        
        List<ChatMessage> history = recent.stream()
                .map(ch -> ChatMessage.builder()
                        .role(ch.getRole())
                        .content(ch.getContent())
                        .build())
                .collect(Collectors.toList());
        
        Collections.reverse(history);
        return history;
    }

    /**
     * Persist a user message and the assistant reply to the database.
     */
    @Transactional
    public void addExchange(Long userId, String userMessage, String assistantReply) {
        ChatHistory userTurn = ChatHistory.builder()
                .userId(userId)
                .role("user")
                .content(userMessage)
                .build();
        
        ChatHistory assistantTurn = ChatHistory.builder()
                .userId(userId)
                .role("assistant")
                .content(assistantReply)
                .build();
        
        repository.save(userTurn);
        repository.save(assistantTurn);
    }
}

