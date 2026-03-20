package com.studentmeal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "weekly_menus")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyMenu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id")
    private MealPartner partner;

    @Column(nullable = false)
    private LocalDate weekStartDate;

    private String description;

    @OneToMany(mappedBy = "menu", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MenuItem> items;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
