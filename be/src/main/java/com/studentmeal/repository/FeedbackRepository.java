package com.studentmeal.repository;

import com.studentmeal.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByPartner_IdOrderByCreatedAtDesc(Long partnerId);

    List<Feedback> findByCustomerId(Long customerId);
}
