package com.studentmeal.repository;

import com.studentmeal.entity.ChatHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    
    /**
     * Finds the most recent messages for a specific user.
     * Use PageRequest.of(0, 6) to get the last 3 turns (user+assistant pairs).
     */
    List<ChatHistory> findByUserIdOrderByTimestampDesc(Long userId, Pageable pageable);
}
