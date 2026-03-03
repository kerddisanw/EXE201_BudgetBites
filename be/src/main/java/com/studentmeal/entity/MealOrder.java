package com.studentmeal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "meal_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id")
    private Subscription subscription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id")
    private MealPartner partner;

    // Món ăn cụ thể được chọn từ thực đơn (optional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id")
    private MenuItem menuItem;

    @Column(nullable = false)
    private LocalDate orderDate;

    @Column(nullable = false)
    private String mealType; // Breakfast / Lunch / Dinner

    @Column(nullable = false)
    private Boolean withTray = false; // Thêm khay ăn và dụng cụ ăn (+1,000đ)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    public enum OrderStatus {
        PENDING, PREPARING, DELIVERED, CANCELLED
    }
}
