package com.studentmeal.service;

import com.studentmeal.dto.*;
import com.studentmeal.entity.*;
import com.studentmeal.exception.ResourceNotFoundException;
import com.studentmeal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final MenuItemRepository menuItemRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final MealOrderRepository mealOrderRepository;

    @Transactional(readOnly = true)
    public CartResponse getCart() {
        Customer customer = getCurrentCustomer();
        List<CartItem> items = cartItemRepository.findByCustomerId(customer.getId());

        List<CartItemDTO> dtos = items.stream().map(this::toDTO).collect(Collectors.toList());
        BigDecimal totalAmount = dtos.stream()
                .map(item -> {
                    BigDecimal price = item.getPriceOriginal();
                    if (Boolean.TRUE.equals(item.getWithTray())) {
                        price = price.add(new BigDecimal("1000")); // +1.000đ cho khay ăn
                    }
                    return price;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CartResponse response = new CartResponse();
        response.setItems(dtos);
        response.setTotalItems(dtos.size());
        response.setTotalAmount(totalAmount);
        return response;
    }

    @Transactional
    public CartItemDTO addToCart(CartAddRequest request) {
        Customer customer = getCurrentCustomer();

        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "MenuItem not found with id: " + request.getMenuItemId()));

        CartItem cartItem = new CartItem();
        cartItem.setCustomer(customer);
        cartItem.setMenuItem(menuItem);
        cartItem.setOrderDate(request.getOrderDate());
        cartItem.setWithTray(Boolean.TRUE.equals(request.getWithTray()));

        return toDTO(cartItemRepository.save(cartItem));
    }

    @Transactional
    public List<CartItemDTO> addMultipleToCart(CartBatchAddRequest batchRequest) {
        Customer customer = getCurrentCustomer();

        List<CartItem> cartItems = batchRequest.getItems().stream().map(request -> {
            MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "MenuItem not found with id: " + request.getMenuItemId()));

            CartItem cartItem = new CartItem();
            cartItem.setCustomer(customer);
            cartItem.setMenuItem(menuItem);
            cartItem.setOrderDate(request.getOrderDate());
            cartItem.setWithTray(Boolean.TRUE.equals(request.getWithTray()));
            return cartItem;
        }).collect(Collectors.toList());

        return cartItemRepository.saveAll(cartItems).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeFromCart(Long cartItemId) {
        Customer customer = getCurrentCustomer();
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Không có quyền xóa item này");
        }
        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart() {
        Customer customer = getCurrentCustomer();
        cartItemRepository.deleteByCustomerId(customer.getId());
    }

    @Transactional
    public List<MealOrderDTO> checkout(Long subscriptionId) {
        Customer customer = getCurrentCustomer();
        List<CartItem> cartItems = cartItemRepository.findByCustomerId(customer.getId());

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống");
        }

        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));

        List<MealOrder> orders = cartItems.stream().map(cartItem -> {
            MealOrder order = new MealOrder();
            order.setSubscription(subscription);
            order.setPartner(cartItem.getMenuItem().getMenu().getPartner());
            order.setMenuItem(cartItem.getMenuItem());
            order.setOrderDate(cartItem.getOrderDate());
            order.setMealType(cartItem.getMenuItem().getMealType());
            order.setWithTray(cartItem.getWithTray()); // Copy tray selection
            order.setStatus(MealOrder.OrderStatus.PENDING);
            return order;
        }).collect(Collectors.toList());

        List<MealOrder> savedOrders = mealOrderRepository.saveAll(orders);

        cartItemRepository.deleteByCustomerId(customer.getId());

        return savedOrders.stream().map(this::toOrderDTO).collect(Collectors.toList());
    }

    private Customer getCurrentCustomer() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    private CartItemDTO toDTO(CartItem cartItem) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(cartItem.getId());
        dto.setMenuItemId(cartItem.getMenuItem().getId());
        dto.setItemName(cartItem.getMenuItem().getItemName());
        dto.setDayOfWeek(cartItem.getMenuItem().getDayOfWeek() != null
                ? cartItem.getMenuItem().getDayOfWeek().name()
                : null);
        dto.setMealType(cartItem.getMenuItem().getMealType());
        dto.setPriceOriginal(cartItem.getMenuItem().getPriceOriginal());
        dto.setOrderDate(cartItem.getOrderDate());
        dto.setWithTray(cartItem.getWithTray());
        dto.setPartnerId(cartItem.getMenuItem().getMenu().getPartner().getId());
        dto.setPartnerName(cartItem.getMenuItem().getMenu().getPartner().getName());
        dto.setAddedAt(cartItem.getAddedAt());
        return dto;
    }

    private MealOrderDTO toOrderDTO(MealOrder order) {
        MealOrderDTO dto = new MealOrderDTO();
        dto.setId(order.getId());
        dto.setSubscriptionId(order.getSubscription().getId());
        dto.setPartnerId(order.getPartner().getId());
        dto.setPartnerName(order.getPartner().getName());
        if (order.getMenuItem() != null) {
            dto.setMenuItemId(order.getMenuItem().getId());
            dto.setMenuItemName(order.getMenuItem().getItemName());
        }
        dto.setOrderDate(order.getOrderDate());
        dto.setMealType(order.getMealType());
        dto.setWithTray(order.getWithTray());
        dto.setStatus(order.getStatus().name());
        return dto;
    }
}
