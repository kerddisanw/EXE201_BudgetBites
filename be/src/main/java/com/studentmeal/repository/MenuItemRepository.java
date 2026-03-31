package com.studentmeal.repository;

import com.studentmeal.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByMenuId(Long menuId);

    // Lấy tất cả món của 1 menu theo ngày trong tuần
    List<MenuItem> findByMenuIdAndDayOfWeek(Long menuId, MenuItem.DayOfWeek dayOfWeek);

    // Lấy tất cả món của 1 partner theo ngày trong tuần (join qua WeeklyMenu)
    List<MenuItem> findByMenuPartnerIdAndDayOfWeek(Long partnerId, MenuItem.DayOfWeek dayOfWeek);

    // Lấy tất cả món theo ngày trong tuần (chatbot – không cần lọc partner)
    List<MenuItem> findByDayOfWeek(MenuItem.DayOfWeek dayOfWeek);
}
