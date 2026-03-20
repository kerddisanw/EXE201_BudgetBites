package com.studentmeal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "meal_partners")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MealPackage> packages;

    @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WeeklyMenu> weeklyMenus;

    @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Feedback> feedbacks;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String address;

    private String phoneNumber;

    private String email;

    private String imageUrl;

    // Tọa độ GPS quán ăn (dùng cho tính năng tracking)
    private Double latitude;
    private Double longitude;

    @Column(nullable = false)
    private Boolean active = false;

    private java.math.BigDecimal discountRate;

    @Column(nullable = false)
    private Boolean status = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
