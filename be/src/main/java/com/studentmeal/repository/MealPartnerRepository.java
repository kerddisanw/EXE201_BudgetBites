package com.studentmeal.repository;

import com.studentmeal.entity.MealPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MealPartnerRepository extends JpaRepository<MealPartner, Long> {
    List<MealPartner> findByActiveTrue();
}
