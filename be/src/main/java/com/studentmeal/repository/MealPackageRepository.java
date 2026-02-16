package com.studentmeal.repository;

import com.studentmeal.entity.MealPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MealPackageRepository extends JpaRepository<MealPackage, Long> {
    List<MealPackage> findByActiveTrue();

    List<MealPackage> findByPackageType(MealPackage.PackageType packageType);
}
