package com.studentmeal.repository;

import com.studentmeal.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByCustomerId(Long customerId);

    List<Subscription> findByStatus(Subscription.SubscriptionStatus status);

    long countByStatus(Subscription.SubscriptionStatus status);

    /** Hợp đồng gói combo thật — không tính bản ghi tạo chỉ để thanh toán giỏ món lẻ. */
    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.notes IS NULL OR s.notes <> :cartNote")
    long countExcludingCartCheckout(@Param("cartNote") String cartNote);

    @Query(
            "SELECT COUNT(s) FROM Subscription s WHERE s.status = :status "
                    + "AND (s.notes IS NULL OR s.notes <> :cartNote)")
    long countByStatusExcludingCartCheckout(
            @Param("status") Subscription.SubscriptionStatus status, @Param("cartNote") String cartNote);

    long countByNotes(String notes);
}
