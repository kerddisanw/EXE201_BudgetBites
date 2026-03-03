package com.studentmeal.repository;

import com.studentmeal.entity.WeeklyMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WeeklyMenuRepository extends JpaRepository<WeeklyMenu, Long> {
    List<WeeklyMenu> findByPartnerId(Long partnerId);

    List<WeeklyMenu> findByWeekStartDate(LocalDate weekStartDate);
}
