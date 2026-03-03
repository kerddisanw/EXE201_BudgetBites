package com.studentmeal.repository;

import com.studentmeal.entity.SubscriptionDiscount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionDiscountRepository extends JpaRepository<SubscriptionDiscount, Long> {
    List<SubscriptionDiscount> findBySubscriptionId(Long subscriptionId);
}
