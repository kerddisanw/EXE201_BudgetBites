package com.studentmeal.service;

import com.studentmeal.dto.MenuItemDTO;
import com.studentmeal.dto.WeeklyMenuDTO;
import com.studentmeal.dto.WeeklyMenuRequest;
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

import java.util.List;
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
                itemDto.setItemName(item.getItemName());
                itemDto.setMealType(item.getMealType());
                itemDto.setCalories(item.getCalories());
                itemDto.setPriceOriginal(item.getPriceOriginal());
                return itemDto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}
