package com.studentmeal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "menu_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id")
    private WeeklyMenu menu;

    @Column(nullable = false)
    private String mealType; // Lunch / Dinner

    @Column(nullable = false)
    private String itemName;

    private Integer calories;

    @Column(nullable = false)
    private BigDecimal priceOriginal;
}
