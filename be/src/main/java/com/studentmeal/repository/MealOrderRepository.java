package com.studentmeal.repository;

import com.studentmeal.entity.MealOrder;
import com.studentmeal.entity.Payment;
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
            join Payment p on p.subscription = mo.subscription
            where mo.subscription.customer.id = :customerId
              and mo.partner.id = :partnerId
              and p.status = :paymentStatus
            """)
    boolean existsPaidOrderByCustomerAndPartner(
            Long customerId,
            Long partnerId,
            Payment.PaymentStatus paymentStatus
    );
}
