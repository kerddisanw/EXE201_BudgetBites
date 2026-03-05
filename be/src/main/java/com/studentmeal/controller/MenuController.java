package com.studentmeal.controller;

import com.studentmeal.dto.MenuItemDTO;
import com.studentmeal.dto.WeeklyMenuDTO;
import com.studentmeal.dto.WeeklyMenuRequest;
import com.studentmeal.dto.WeeklyScheduleDTO;
import com.studentmeal.entity.MenuItem;
import com.studentmeal.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    public ResponseEntity<List<WeeklyMenuDTO>> getAllMenus() {
        return ResponseEntity.ok(menuService.getAllMenus());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WeeklyMenuDTO> getMenuById(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.getMenuById(id));
    }

    @GetMapping("/partners/{partnerId}")
    public ResponseEntity<List<WeeklyMenuDTO>> getMenusByPartner(@PathVariable Long partnerId) {
        return ResponseEntity.ok(menuService.getMenusByPartner(partnerId));
    }

    /**
     * Xem toàn bộ món ăn của 1 tuần theo ngày trong tuần.
     * Dùng để user chọn "hôm nay là thứ mấy, có món gì?"
     *
     * GET /api/menus/{menuId}/items?day=MONDAY
     * → Trả về danh sách tất cả món trong thực đơn tuần đó, chỉ ngày MONDAY
     */
    @GetMapping("/{menuId}/items")
    public ResponseEntity<List<MenuItemDTO>> getMenuItemsByDay(
            @PathVariable Long menuId,
            @RequestParam MenuItem.DayOfWeek day) {
        return ResponseEntity.ok(menuService.getMenuItemsByDay(menuId, day));
    }

    /**
     * Xem tất cả món ăn của 1 partner theo ngày trong tuần (không cần biết menuId).
     * Đây là API chính để user duyệt lịch ăn:
     *
     * GET /api/menus/partner/1/day/MONDAY → Thứ 2 có gì ăn ở quán 1?
     * GET /api/menus/partner/1/day/WEDNESDAY → Thứ 4 có gì ăn?
     */
    @GetMapping("/partners/{partnerId}/items")
    public ResponseEntity<List<MenuItemDTO>> getMenuItemsByPartnerAndDay(
            @PathVariable Long partnerId,
            @RequestParam MenuItem.DayOfWeek day) {
        return ResponseEntity.ok(menuService.getMenuItemsByPartnerAndDay(partnerId, day));
    }

    /**
     * API chính cho UI "Chọn bữa ăn"
     * Trả về lịch thực đơn tuần đã nhóm theo ngày → buổi → danh sách món (có ảnh)
     *
     * GET /api/menus/partner/1/schedule
     * Response:
     * {
     * "MONDAY": { "Lunch": [...], "Dinner": [...] },
     * "WEDNESDAY": { "Lunch": [...] }
     * }
     */
    @GetMapping("/partners/{partnerId}/schedule")
    public ResponseEntity<WeeklyScheduleDTO> getWeeklySchedule(@PathVariable Long partnerId) {
        return ResponseEntity.ok(menuService.getWeeklySchedule(partnerId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WeeklyMenuDTO> createMenu(@RequestBody WeeklyMenuRequest request) {
        return ResponseEntity.ok(menuService.createMenu(request));
    }
}
