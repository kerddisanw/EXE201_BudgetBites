package com.studentmeal.repository;

import com.studentmeal.entity.DiscountCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DiscountCodeRepository extends JpaRepository<DiscountCode, Long> {
    Optional<DiscountCode> findByCode(String code);

    @Query("SELECT COUNT(d) FROM DiscountCode d WHERE d.code = :code AND d.id <> :id")
    long countOtherWithCode(@Param("code") String code, @Param("id") Long id);
}
