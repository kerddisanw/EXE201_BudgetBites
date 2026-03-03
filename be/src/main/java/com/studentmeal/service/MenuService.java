package com.studentmeal.service;

import com.studentmeal.dto.MenuItemDTO;
import com.studentmeal.dto.WeeklyMenuDTO;
import com.studentmeal.dto.WeeklyMenuRequest;
import com.studentmeal.dto.WeeklyScheduleDTO;
import com.studentmeal.entity.MealPartner;
import com.studentmeal.entity.MenuItem;
import com.studentmeal.entity.WeeklyMenu;
import com.studentmeal.exception.ResourceNotFoundException;
import com.studentmeal.repository.MealPartnerRepository;
import com.studentmeal.repository.MenuItemRepository;
import com.studentmeal.repository.WeeklyMenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final WeeklyMenuRepository weeklyMenuRepository;
    private final MenuItemRepository menuItemRepository;
    private final MealPartnerRepository mealPartnerRepository;

    @Transactional(readOnly = true)
    public List<WeeklyMenuDTO> getAllMenus() {
        return weeklyMenuRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WeeklyMenuDTO getMenuById(Long id) {
        WeeklyMenu menu = weeklyMenuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found"));
        return convertToDTO(menu);
    }

    @Transactional(readOnly = true)
    public List<WeeklyMenuDTO> getMenusByPartner(Long partnerId) {
        return weeklyMenuRepository.findByPartnerId(partnerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy các món ăn của 1 menu (weeklyMenuId) theo ngày trong tuần.
     * VD: GET /api/menus/1/items?day=MONDAY
     * → trả về tất cả món Thứ 2 trong thực đơn tuần đó
     */
    @Transactional(readOnly = true)
    public List<MenuItemDTO> getMenuItemsByDay(Long menuId, MenuItem.DayOfWeek dayOfWeek) {
        return menuItemRepository.findByMenuIdAndDayOfWeek(menuId, dayOfWeek)
                .stream()
                .map(this::toMenuItemDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy các món ăn theo partner + ngày trong tuần (không cần biết menuId).
     * VD: GET /api/menus/partner/1/day/MONDAY
     * → trả về tất cả món Thứ 2 của quán đó (tuần gần nhất)
     */
    @Transactional(readOnly = true)
    public List<MenuItemDTO> getMenuItemsByPartnerAndDay(Long partnerId, MenuItem.DayOfWeek dayOfWeek) {
        return menuItemRepository.findByMenuPartnerIdAndDayOfWeek(partnerId, dayOfWeek)
                .stream()
                .map(this::toMenuItemDTO)
                .collect(Collectors.toList());
    }

    /**
     * Trả về lịch thực đơn tuần theo format UI:
     * dayOfWeek → mealType → list món
     *
     * GET /api/menus/partner/{partnerId}/schedule
     */
    @Transactional(readOnly = true)
    public WeeklyScheduleDTO getWeeklySchedule(Long partnerId) {
        // Lấy menu tuần mới nhất của partner
        List<WeeklyMenu> menus = weeklyMenuRepository.findByPartnerId(partnerId);
        if (menus.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy thực đơn cho partner id: " + partnerId);
        }

        // Lấy menu tuần mới nhất (sort theo weekStartDate desc)
        WeeklyMenu latestMenu = menus.stream()
                .max((a, b) -> a.getWeekStartDate().compareTo(b.getWeekStartDate()))
                .get();

        // Group: dayOfWeek → mealType → list items
        // Dùng LinkedHashMap để giữ thứ tự theo enum (MONDAY đầu tiên)
        Map<String, Map<String, List<MenuItemDTO>>> schedule = new LinkedHashMap<>();

        // Sắp xếp theo thứ tự ngày trong tuần
        String[] dayOrder = { "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY" };

        if (latestMenu.getItems() != null) {
            // Nhóm items theo dayOfWeek → mealType
            Map<String, Map<String, List<MenuItemDTO>>> grouped = latestMenu.getItems().stream()
                    .filter(item -> item.getDayOfWeek() != null)
                    .collect(Collectors.groupingBy(
                            item -> item.getDayOfWeek().name(),
                            Collectors.groupingBy(
                                    MenuItem::getMealType,
                                    Collectors.mapping(this::toMenuItemDTO, Collectors.toList()))));

            // Chèn vào đúng thứ tự ngày
            for (String day : dayOrder) {
                if (grouped.containsKey(day)) {
                    schedule.put(day, grouped.get(day));
                }
            }
        }

        WeeklyScheduleDTO dto = new WeeklyScheduleDTO();
        dto.setMenuId(latestMenu.getId());
        dto.setPartnerId(latestMenu.getPartner().getId());
        dto.setPartnerName(latestMenu.getPartner().getName());
        dto.setWeekStartDate(latestMenu.getWeekStartDate().toString());
        dto.setSchedule(schedule);
        return dto;
    }

    @Transactional
    public WeeklyMenuDTO createMenu(WeeklyMenuRequest request) {
        MealPartner partner = mealPartnerRepository.findById(request.getPartnerId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Partner not found with id: " + request.getPartnerId()));

        WeeklyMenu menu = new WeeklyMenu();
        menu.setPartner(partner);
        menu.setWeekStartDate(request.getWeekStartDate());
        menu.setDescription(request.getDescription());

        WeeklyMenu savedMenu = weeklyMenuRepository.save(menu);

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            List<MenuItem> items = request.getItems().stream().map(itemRequest -> {
                MenuItem item = new MenuItem();
                item.setMenu(savedMenu);
                item.setDayOfWeek(itemRequest.getDayOfWeek());
                item.setItemName(itemRequest.getItemName());
                item.setMealType(itemRequest.getMealType());
                item.setCalories(itemRequest.getCalories());
                item.setPriceOriginal(itemRequest.getPriceOriginal());
                return item;
            }).collect(Collectors.toList());

            menuItemRepository.saveAll(items);
            savedMenu.setItems(items);
        }

        return convertToDTO(savedMenu);
    }

    private WeeklyMenuDTO convertToDTO(WeeklyMenu menu) {
        WeeklyMenuDTO dto = new WeeklyMenuDTO();
        dto.setId(menu.getId());
        dto.setPartnerId(menu.getPartner().getId());
        dto.setPartnerName(menu.getPartner().getName());
        dto.setWeekStartDate(menu.getWeekStartDate());
        dto.setDescription(menu.getDescription());
        dto.setCreatedAt(menu.getCreatedAt());

        if (menu.getItems() != null) {
            dto.setItems(menu.getItems().stream().map(item -> {
                MenuItemDTO itemDto = new MenuItemDTO();
                itemDto.setId(item.getId());
                itemDto.setDayOfWeek(item.getDayOfWeek() != null ? item.getDayOfWeek().name() : null);
                itemDto.setItemName(item.getItemName());
                itemDto.setMealType(item.getMealType());
                itemDto.setCalories(item.getCalories());
                itemDto.setPriceOriginal(item.getPriceOriginal());
                return itemDto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }

    private MenuItemDTO toMenuItemDTO(MenuItem item) {
        MenuItemDTO dto = new MenuItemDTO();
        dto.setId(item.getId());
        dto.setDayOfWeek(item.getDayOfWeek() != null ? item.getDayOfWeek().name() : null);
        dto.setMealType(item.getMealType());
        dto.setItemName(item.getItemName());
        dto.setImageUrl(item.getImageUrl());
        dto.setCalories(item.getCalories());
        dto.setPriceOriginal(item.getPriceOriginal());
        return dto;
    }
}
