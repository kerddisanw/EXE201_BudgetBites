package com.studentmeal.repository;

import com.studentmeal.entity.MealOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealOrderRepository extends JpaRepository<MealOrder, Long> {
    List<MealOrder> findBySubscriptionId(Long subscriptionId);

    boolean existsBySubscriptionId(Long subscriptionId);

    List<MealOrder> findByPartnerIdAndOrderDate(Long partnerId, LocalDate orderDate);
}
