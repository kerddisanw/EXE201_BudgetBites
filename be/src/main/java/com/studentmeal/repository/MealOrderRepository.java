package com.studentmeal.repository;

import com.studentmeal.entity.MealOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealOrderRepository extends JpaRepository<MealOrder, Long> {
    List<MealOrder> findBySubscriptionId(Long subscriptionId);

    boolean existsBySubscriptionId(Long subscriptionId);

    List<MealOrder> findByPartnerIdAndOrderDate(Long partnerId, LocalDate orderDate);

    @Query("""
            select (count(mo) > 0)
            from MealOrder mo
            where mo.subscription.customer.id = :customerId
              and mo.partner.id = :partnerId
              and mo.status = :orderStatus
            """)
    boolean existsCompletedOrderByCustomerAndPartner(
            Long customerId,
            Long partnerId,
            MealOrder.OrderStatus orderStatus
    );
}
