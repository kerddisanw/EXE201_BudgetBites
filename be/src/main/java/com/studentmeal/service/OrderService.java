package com.studentmeal.service;

import com.studentmeal.dto.MealOrderDTO;
import com.studentmeal.dto.MealOrderRequest;
import com.studentmeal.entity.MealOrder;
import com.studentmeal.entity.MealPartner;
import com.studentmeal.entity.MenuItem;
import com.studentmeal.entity.Subscription;
import com.studentmeal.exception.ResourceNotFoundException;
import com.studentmeal.repository.MealOrderRepository;
import com.studentmeal.repository.MealPartnerRepository;
import com.studentmeal.repository.MenuItemRepository;
import com.studentmeal.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final MealOrderRepository mealOrderRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final MealPartnerRepository mealPartnerRepository;
    private final MenuItemRepository menuItemRepository;

    @Transactional(readOnly = true)
    public List<MealOrderDTO> getOrdersBySubscription(Long subscriptionId) {
        return mealOrderRepository.findBySubscriptionId(subscriptionId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MealOrderDTO createOrder(MealOrderRequest request) {
        Subscription subscription = subscriptionRepository.findById(request.getSubscriptionId())
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));

        MealPartner partner = mealPartnerRepository.findById(request.getPartnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Partner not found"));

        MealOrder order = new MealOrder();
        order.setSubscription(subscription);
        order.setPartner(partner);
        order.setOrderDate(request.getOrderDate());
        order.setMealType(request.getMealType());
        order.setStatus(MealOrder.OrderStatus.PENDING);

        // Gắn menuItem nếu user chọn món cụ thể
        if (request.getMenuItemId() != null) {
            MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "MenuItem not found with id: " + request.getMenuItemId()));
            order.setMenuItem(menuItem);
        }

        return convertToDTO(mealOrderRepository.save(order));
    }

    @Transactional
    public MealOrderDTO updateOrderStatus(Long orderId, MealOrder.OrderStatus status) {
        MealOrder order = mealOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(status);
        return convertToDTO(mealOrderRepository.save(order));
    }

    private MealOrderDTO convertToDTO(MealOrder order) {
        MealOrderDTO dto = new MealOrderDTO();
        dto.setId(order.getId());
        dto.setSubscriptionId(order.getSubscription().getId());
        dto.setPartnerId(order.getPartner().getId());
        dto.setPartnerName(order.getPartner().getName());
        dto.setOrderDate(order.getOrderDate());
        dto.setMealType(order.getMealType());
        dto.setStatus(order.getStatus().name());

        if (order.getMenuItem() != null) {
            dto.setMenuItemId(order.getMenuItem().getId());
            dto.setMenuItemName(order.getMenuItem().getItemName());
        }

        return dto;
    }
}
