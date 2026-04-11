package com.studentmeal.service;

import com.studentmeal.BudgetBitesConstants;
import com.studentmeal.entity.Payment;
import com.studentmeal.entity.Subscription;
import com.studentmeal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private static final String CART_SUB_NOTE = BudgetBitesConstants.SUBSCRIPTION_NOTES_CART_CHECKOUT_NO_PACKAGE;

    private final CustomerRepository customerRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final MealPartnerRepository mealPartnerRepository;
    private final PaymentRepository paymentRepository;
    private final MealOrderRepository mealOrderRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new LinkedHashMap<>();

        long totalCustomers = customerRepository.count();
        stats.put("totalCustomers", totalCustomers);
        stats.put("activeCustomers", customerRepository.countByActiveTrue());
        stats.put("inactiveCustomers", customerRepository.countByActiveFalse());

        stats.put("totalPartners", mealPartnerRepository.count());
        stats.put("activePartners", mealPartnerRepository.countByActiveTrue());
        stats.put("inactivePartners", mealPartnerRepository.countByActiveFalse());
        stats.put("approvedActivePartners", mealPartnerRepository.countByActiveTrueAndStatusTrue());

        // Hợp đồng gói combo thật (không tính bản ghi subscription chỉ để PayOS + giỏ món lẻ).
        long packageSubscriptions = subscriptionRepository.countExcludingCartCheckout(CART_SUB_NOTE);
        stats.put("totalSubscriptions", packageSubscriptions);
        stats.put("cartCheckoutSubscriptions", subscriptionRepository.countByNotes(CART_SUB_NOTE));

        stats.put("totalMealOrders", mealOrderRepository.count());

        Map<String, Long> subsByStatus = new LinkedHashMap<>();
        for (Subscription.SubscriptionStatus s : Subscription.SubscriptionStatus.values()) {
            subsByStatus.put(s.name(), subscriptionRepository.countByStatusExcludingCartCheckout(s, CART_SUB_NOTE));
        }
        stats.put("subscriptionsByStatus", subsByStatus);

        List<Payment> allPayments = paymentRepository.findAll();
        BigDecimal allPaymentSum = allPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalRevenue", allPaymentSum);

        List<Payment> completedPayments = paymentRepository.findByStatus(Payment.PaymentStatus.COMPLETED);
        BigDecimal completedRevenue = completedPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("completedRevenue", completedRevenue);

        stats.put("pendingPaymentsCount", paymentRepository.countByStatus(Payment.PaymentStatus.PENDING));
        stats.put("failedPaymentsCount", paymentRepository.countByStatus(Payment.PaymentStatus.FAILED));

        if (!completedPayments.isEmpty()) {
            stats.put(
                    "averageCompletedPayment",
                    completedRevenue.divide(BigDecimal.valueOf(completedPayments.size()), 2, RoundingMode.HALF_UP));
        } else {
            stats.put("averageCompletedPayment", BigDecimal.ZERO);
        }

        stats.put("revenueByMonth", buildRevenueByMonth(completedPayments));
        stats.put("subscriptionsByMonth", buildSubscriptionsByMonth());
        stats.put("mealOrdersByMonth", buildMealOrdersByMonth());

        return stats;
    }

    private static LocalDateTime effectivePaymentInstant(Payment p) {
        return p.getCompletedAt() != null ? p.getCompletedAt() : p.getCreatedAt();
    }

    private List<Map<String, Object>> buildRevenueByMonth(List<Payment> completedPayments) {
        YearMonth now = YearMonth.now();
        List<YearMonth> months = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            months.add(now.minusMonths(i));
        }

        Map<YearMonth, BigDecimal> sums = completedPayments.stream()
                .collect(Collectors.groupingBy(
                        p -> YearMonth.from(effectivePaymentInstant(p)),
                        Collectors.reducing(BigDecimal.ZERO, Payment::getAmount, BigDecimal::add)));

        List<Map<String, Object>> series = new ArrayList<>();
        for (YearMonth ym : months) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("month", ym.toString());
            row.put("label", monthLabel(ym));
            row.put("amount", sums.getOrDefault(ym, BigDecimal.ZERO));
            series.add(row);
        }
        return series;
    }

    private boolean isPackageSubscription(Subscription s) {
        return s.getNotes() == null || !CART_SUB_NOTE.equals(s.getNotes());
    }

    private List<Map<String, Object>> buildSubscriptionsByMonth() {
        YearMonth now = YearMonth.now();
        List<YearMonth> months = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            months.add(now.minusMonths(i));
        }

        Map<YearMonth, Long> counts = subscriptionRepository.findAll().stream()
                .filter(this::isPackageSubscription)
                .collect(Collectors.groupingBy(s -> YearMonth.from(s.getCreatedAt()), Collectors.counting()));

        List<Map<String, Object>> series = new ArrayList<>();
        for (YearMonth ym : months) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("month", ym.toString());
            row.put("label", monthLabel(ym));
            row.put("count", counts.getOrDefault(ym, 0L));
            series.add(row);
        }
        return series;
    }

    private List<Map<String, Object>> buildMealOrdersByMonth() {
        YearMonth now = YearMonth.now();
        List<YearMonth> months = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            months.add(now.minusMonths(i));
        }

        Map<YearMonth, Long> counts = mealOrderRepository.findAll().stream()
                .collect(Collectors.groupingBy(mo -> YearMonth.from(mo.getOrderDate()), Collectors.counting()));

        List<Map<String, Object>> series = new ArrayList<>();
        for (YearMonth ym : months) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("month", ym.toString());
            row.put("label", monthLabel(ym));
            row.put("count", counts.getOrDefault(ym, 0L));
            series.add(row);
        }
        return series;
    }

    private static String monthLabel(YearMonth ym) {
        return String.format("T%d/%d", ym.getMonthValue(), ym.getYear());
    }

    public List<com.studentmeal.entity.Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public com.studentmeal.entity.Customer toggleCustomerActive(Long id) {
        com.studentmeal.entity.Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new com.studentmeal.exception.ResourceNotFoundException("Customer not found"));
        customer.setActive(!customer.getActive());
        return customerRepository.save(customer);
    }
}
