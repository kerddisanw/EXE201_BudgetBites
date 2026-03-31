package com.studentmeal.service;

import com.studentmeal.dto.ChatMessage;
import com.studentmeal.dto.ChatRequest;
import com.studentmeal.dto.ChatResponse;
import com.studentmeal.dto.MealPackageDTO;
import com.studentmeal.entity.*;
import com.studentmeal.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Core chatbot orchestrator.
 *
 * Flow:
 *  1. Load conversation history (last 3 turns)
 *  2. Detect intent via keyword matching
 *  3. Gather business context from DB
 *  4. Try OpenAI API → if unavailable, run rule-based reply builder
 *  5. Persist exchange to memory store
 *  6. Return ChatResponse with reply, suggested packages, and action buttons
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    /* ── Repositories ───────────────────────────────────────────────── */
    private final CustomerRepository      customerRepository;
    private final MealPackageRepository   packageRepository;
    private final SubscriptionRepository  subscriptionRepository;
    private final MealOrderRepository     orderRepository;
    private final MenuItemRepository      menuItemRepository;

    /* ── Collaborators ───────────────────────────────────────────────── */
    private final IntentDetector          intentDetector;
    private final ConversationMemoryStore memoryStore;
    private final GeminiClient            geminiClient;

    /* ─────────────────────────────────────────────────────────────────
       PUBLIC ENTRY POINT
    ───────────────────────────────────────────────────────────────── */

    @Transactional
    public ChatResponse handleMessage(ChatRequest request) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged in customer not found"));
        Long userId = customer.getId();
        String message = request.getMessage().trim();

        // 1. Detect intent
        IntentDetector.Intent intent = intentDetector.detect(message);
        Long budget = intentDetector.extractBudget(message);

        // If user mentioned a budget (e.g. 200k), force budget intent even if they said "gói"
        if (budget != null) {
            intent = IntentDetector.Intent.BUDGET_MEAL;
        }
        
        log.debug("[Chatbot] userId={} intent={} msg='{}'", userId, intent, message);

        // 2. Conversation history
        List<ChatMessage> history = memoryStore.getHistory(userId);

        // 3. Build business context & gather suggested packages
        BusinessContext ctx = buildContext(userId, intent, message);

        // 4. Generate reply (AI first, then rule-based fallback)
        String systemPrompt = buildSystemPrompt(ctx);
        String reply = geminiClient.chat(systemPrompt, history, message);
        if (reply == null || reply.isBlank()) {
            reply = buildRuleBasedReply(intent, ctx, message);
        }

        // 5. Save exchange to memory
        memoryStore.addExchange(userId, message, reply);

        // 6. Map suggested packages to DTOs
        List<MealPackageDTO> packageDTOs = ctx.suggestedPackages.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ChatResponse.builder()
                .reply(reply)
                .suggestedPackages(packageDTOs)
                .actions(ctx.actions)
                .detectedIntent(intent.name())
                .build();
    }

    /* ─────────────────────────────────────────────────────────────────
       BUSINESS CONTEXT BUILDER
    ───────────────────────────────────────────────────────────────── */

    private BusinessContext buildContext(Long userId, IntentDetector.Intent intent, String message) {
        BusinessContext ctx = new BusinessContext();
        ctx.userId = userId;
        ctx.intent = intent;

        // Always load active packages for reference
        List<MealPackage> allActive = packageRepository.findByActiveTrue();
        ctx.suggestedPackages = allActive; // Pre-fill with all active packages for AI context

        switch (intent) {
            case BUDGET_MEAL -> {
                Long budget = intentDetector.extractBudget(message);
                ctx.budget = budget;
                if (budget != null) {
                    ctx.suggestedPackages = allActive.stream()
                            .filter(p -> p.getPrice().compareTo(BigDecimal.valueOf(budget)) <= 0)
                            .sorted(Comparator.comparing(MealPackage::getPrice))
                            .limit(3)
                            .collect(Collectors.toList());
                } else {
                    // No budget detected → suggest top 3 cheapest
                    ctx.suggestedPackages = allActive.stream()
                            .sorted(Comparator.comparing(MealPackage::getPrice))
                            .limit(3)
                            .collect(Collectors.toList());
                }
                ctx.actions = List.of("VIEW_PACKAGE", "SUBSCRIBE");
            }

            case NUTRITION_ADVICE -> {
                // Suggest packages with low-calorie menu items
                ctx.suggestedPackages = allActive.stream()
                        .sorted(Comparator.comparing(MealPackage::getPrice))
                        .limit(3)
                        .collect(Collectors.toList());

                // Low-calorie items from today's menu
                String today = LocalDate.now()
                        .getDayOfWeek()
                        .getDisplayName(TextStyle.FULL, Locale.ENGLISH)
                        .toUpperCase();
                try {
                    MenuItem.DayOfWeek dow = MenuItem.DayOfWeek.valueOf(today);
                    ctx.lowCalorieItems = menuItemRepository.findByDayOfWeek(dow).stream()
                            .filter(i -> i.getCalories() != null && i.getCalories() < 500)
                            .sorted(Comparator.comparingInt(MenuItem::getCalories))
                            .limit(5)
                            .collect(Collectors.toList());
                } catch (IllegalArgumentException ignored) { }

                ctx.actions = List.of("VIEW_MENU", "VIEW_PACKAGE");
            }

            case MENU_QUERY -> {
                String today = LocalDate.now()
                        .getDayOfWeek()
                        .getDisplayName(TextStyle.FULL, Locale.ENGLISH)
                        .toUpperCase();
                try {
                    MenuItem.DayOfWeek dow = MenuItem.DayOfWeek.valueOf(today);
                    ctx.todayItems = menuItemRepository.findByDayOfWeek(dow);
                } catch (IllegalArgumentException ignored) { }
                ctx.actions = List.of("VIEW_MENU");
            }

            case SUBSCRIPTION_INFO -> {
                List<Subscription> subs = subscriptionRepository.findByCustomerId(userId);
                ctx.activeSubscription = subs.stream()
                        .filter(s -> s.getStatus() == Subscription.SubscriptionStatus.ACTIVE)
                        .findFirst()
                        .orElse(null);
                ctx.suggestedPackages = ctx.activeSubscription == null
                        ? allActive.stream().limit(3).collect(Collectors.toList())
                        : List.of();
                ctx.actions = ctx.activeSubscription != null
                        ? List.of("RENEW", "VIEW_SUBSCRIPTION")
                        : List.of("VIEW_PACKAGE", "SUBSCRIBE");
            }

            case ORDER_INFO -> {
                List<Subscription> subs = subscriptionRepository.findByCustomerId(userId);
                subs.stream()
                        .filter(s -> s.getStatus() == Subscription.SubscriptionStatus.ACTIVE)
                        .findFirst()
                        .ifPresent(sub -> {
                            LocalDate today2 = LocalDate.now();
                            ctx.todayOrders = orderRepository.findBySubscriptionId(sub.getId())
                                    .stream()
                                    .filter(o -> today2.equals(o.getOrderDate()))
                                    .collect(Collectors.toList());
                        });
                ctx.actions = List.of("TRACK_ORDER");
            }

            case GREETING -> {
                ctx.suggestedPackages = allActive.stream().limit(3).collect(Collectors.toList());
                ctx.actions = List.of("VIEW_PACKAGE", "VIEW_MENU");
            }

            default -> {
                ctx.suggestedPackages = allActive.stream().limit(3).collect(Collectors.toList());
                ctx.actions = List.of("VIEW_PACKAGE", "VIEW_MENU", "CONTACT_SUPPORT");
            }
        }

        return ctx;
    }

    /* ─────────────────────────────────────────────────────────────────
       OPENAI SYSTEM PROMPT
    ───────────────────────────────────────────────────────────────── */

    private String buildSystemPrompt(BusinessContext ctx) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
                Bạn là Trợ lý AI tư vấn gói ăn dành cho sinh viên (Student Meal Combo).
                Mục tiêu của bạn là hiểu chính xác nhu cầu người dùng và đưa ra đề xuất gói ăn phù hợp nhất dựa trên ngữ cảnh hội thoại, ngay cả khi người dùng diễn đạt mơ hồ, thiếu thông tin hoặc dùng ngôn ngữ đời thường.

                MÔI TRƯỜNG & ĐỐI TƯỢNG:
                - Đối tượng là sinh viên -> Ưu tiên giá rẻ, tiện lợi, đủ no và hợp lý.
                - Có nhiều combo ăn theo ngày (sáng, trưa, tối) với đầy đủ thông tin giá tiền, món ăn, lượng calo.

                KHI NHẬN TIN NHẮN, HÃY:
                1. Xác định ý định (intent) của người dùng (mua gói, hỏi giá, so sánh, tư vấn).
                2. Trích xuất thông tin: Ngân sách, mục tiêu (giảm cân, ăn no, tiết kiệm), sở thích (ăn chay, không cay, thích gà...), thời gian (1 ngày, 1 tuần...).
                3. Nếu thiếu thông tin quan trọng -> Hỏi lại 1-2 câu ngắn gọn để làm rõ.
                4. Nếu đã đủ -> Đề xuất 1-3 gói (combo) phù hợp nhất có trong hệ thống (dữ liệu liệt kê bên dưới).

                QUY TẮC PHẢN HỒI:
                - Ngắn gọn, rõ ràng, tập trung vào tính thực tế cho sinh viên.
                - Giải thích ngắn gọn lý do chọn combo đó.
                - Định dạng đề xuất:
                   * Tên combo
                   * Giá tiền
                   * Mô tả món ăn/calo
                   * Lý do phù hợp
                   * Gợi ý thêm (nếu cần)
                
                XỬ LÝ NGÔN NGỮ:
                - Hiểu các câu mơ hồ như: "ăn sao cho ổn", "combo nào ok", "ít tiền thôi".
                - Trong trường hợp này, hãy suy luận sinh viên thường cần tiết kiệm và hỏi lại xác nhận nếu cần.
                - Nếu có dữ liệu về chiều cao/cân nặng (người dùng cung cấp trong chat), hãy ước lượng calo và thực đơn tối ưu.

                DỮ LIỆU HỆ THỐNG CUNG CẤP:
                """);

        // Inject available packages
        if (ctx.suggestedPackages != null && !ctx.suggestedPackages.isEmpty()) {
            sb.append("\n=== DANH SÁCH GÓI ĂN (MEAL PACKAGES) ===\n");
            ctx.suggestedPackages.forEach(p ->
                sb.append(String.format("- %s: Giá %,.0f VND | %d ngày, %d bữa/ngày. Mô tả: %s\n",
                        p.getName(), p.getPrice().doubleValue(),
                        p.getDurationDays(), p.getMealsPerDay(), p.getDescription()))
            );
            sb.append("\n");
        }

        // Inject subscription info
        if (ctx.activeSubscription != null) {
            Subscription s = ctx.activeSubscription;
            sb.append(String.format(
                    "=== GÓI HIỆN TẠI CỦA NGƯỜI DÙNG ===\nTên gói: %s | Ngày hết hạn: %s | Trạng thái: %s\n\n",
                    s.getMealPackage().getName(), s.getEndDate(), s.getStatus()
            ));
        }

        // Inject today's menu
        if (ctx.todayItems != null && !ctx.todayItems.isEmpty()) {
            sb.append("=== THỰC ĐƠN HÔM NAY (TODAY'S MENU) ===\n");
            ctx.todayItems.forEach(i ->
                sb.append(String.format("- [%s] %s (%d cal) - %,.0f VND\n",
                        i.getMealType(), i.getItemName(),
                        i.getCalories() != null ? i.getCalories() : 0,
                        i.getPriceOriginal().doubleValue()))
            );
            sb.append("\n");
        }

        if (ctx.budget != null) {
            sb.append(String.format("NGÂN SÁCH NGƯỜI DÙNG NHẮC ĐẾN: %,d VND\n\n", ctx.budget));
        }

        sb.append("Ý định hệ thống nhận diện: ").append(ctx.intent.name()).append("\n");
        sb.append("LUÔN TRẢ LỜI BẰNG TIẾNG VIỆT.");

        return sb.toString();
    }

    /* ─────────────────────────────────────────────────────────────────
       RULE-BASED REPLY BUILDER (fallback when OpenAI is unavailable)
    ───────────────────────────────────────────────────────────────── */

    private String buildRuleBasedReply(IntentDetector.Intent intent, BusinessContext ctx, String message) {
        return switch (intent) {
            case BUDGET_MEAL   -> buildBudgetReply(ctx);
            case NUTRITION_ADVICE -> buildNutritionReply(ctx);
            case MENU_QUERY    -> buildMenuReply(ctx);
            case SUBSCRIPTION_INFO -> buildSubscriptionReply(ctx);
            case ORDER_INFO    -> buildOrderReply(ctx);
            case GREETING      -> buildGreetingReply(ctx);
            default            -> buildFallbackReply();
        };
    }

    private String buildBudgetReply(BusinessContext ctx) {
        if (ctx.suggestedPackages.isEmpty()) {
            long budget = ctx.budget != null ? ctx.budget : 0;
            return String.format(
                "😕 Hiện tại mình không tìm thấy gói nào trong mức ngân sách %,d VND của bạn. " +
                "Bạn thử xem qua các gói khác hoặc liên hệ bộ phận hỗ trợ để được tư vấn gói riêng nhé!",
                budget);
        }

        StringBuilder sb = new StringBuilder();
        if (ctx.budget != null) {
            sb.append(String.format(
                "💰 Với ngân sách %,d VND, đây là những lựa chọn phù hợp nhất cho bạn:\n\n", ctx.budget));
        } else {
            sb.append("🍱 Đây là những gói ăn tiết kiệm nhất dành cho bạn:\n\n");
        }

        ctx.suggestedPackages.forEach(p ->
            sb.append(String.format("• **%s** – %,.0f VND (%d ngày, %d bữa/ngày)\n",
                    p.getName(), p.getPrice().doubleValue(),
                    p.getDurationDays(), p.getMealsPerDay()))
        );
        sb.append("\nBạn có muốn đăng ký một trong các gói này không? 🎉");
        return sb.toString();
    }

    private String buildNutritionReply(BusinessContext ctx) {
        StringBuilder sb = new StringBuilder(
            "🥗 Thật tuyệt khi bạn quan tâm đến sức khỏe! Đây là một vài lời khuyên dành cho sinh viên:\n\n" +
            "• Hãy đảm bảo bữa ăn cân bằng giữa đạm, tinh bột và rau xanh\n" +
            "• Cố gắng kiểm soát bữa trưa dưới 600 calo\n" +
            "• Uống đủ nước – khoảng 2 lít mỗi ngày\n\n"
        );

        if (ctx.lowCalorieItems != null && !ctx.lowCalorieItems.isEmpty()) {
            sb.append("Các lựa chọn ít calo cho hôm nay:\n");
            ctx.lowCalorieItems.forEach(i ->
                sb.append(String.format("• %s – %d cal (%s)\n",
                        i.getItemName(), i.getCalories(), i.getMealType()))
            );
            sb.append("\n");
        }

        if (!ctx.suggestedPackages.isEmpty()) {
            sb.append("Các gói gợi ý cho chế độ dinh dưỡng cân bằng:\n");
            ctx.suggestedPackages.stream().limit(2).forEach(p ->
                sb.append(String.format("• **%s** – %,.0f VND\n",
                        p.getName(), p.getPrice().doubleValue()))
            );
        }
        return sb.toString();
    }

    private String buildMenuReply(BusinessContext ctx) {
        if (ctx.todayItems == null || ctx.todayItems.isEmpty()) {
            return "📋 Thực đơn cho hôm nay chưa được công bố. " +
                   "Hãy quay lại sau hoặc liên hệ với đối tác cung cấp bữa ăn nhé!";
        }

        String day = LocalDate.now().getDayOfWeek()
                .getDisplayName(TextStyle.FULL, new Locale("vi", "VN"));

        StringBuilder sb = new StringBuilder(
            String.format("🗓️ Đây là thực đơn cho ngày **%s**:\n\n", day));

        Map<String, List<MenuItem>> grouped = ctx.todayItems.stream()
                .collect(Collectors.groupingBy(MenuItem::getMealType));

        grouped.forEach((mealType, items) -> {
            sb.append(String.format("**%s:**\n", mealType));
            items.forEach(i -> sb.append(String.format(
                    "  • %s (%s cal) – %,.0f VND\n",
                    i.getItemName(),
                    i.getCalories() != null ? i.getCalories() : "N/A",
                    i.getPriceOriginal().doubleValue())));
            sb.append("\n");
        });

        return sb.toString().trim();
    }

    private String buildSubscriptionReply(BusinessContext ctx) {
        if (ctx.activeSubscription != null) {
            Subscription s = ctx.activeSubscription;
            long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), s.getEndDate());
            
            String urgency = daysLeft <= 3
                ? "⚠️ Gói của bạn sắp hết hạn! "
                : "✅ Gói hiện tại vẫn ổn định! ";

            StringBuilder sb = new StringBuilder(String.format(
                "%sGói đang hoạt động: **%s**\n" +
                "📅 Có hiệu lực đến: %s (còn %d ngày)\n" +
                "💵 Tổng chi phí: %,.0f VND\n\n" +
                "Nếu bạn muốn đổi sang gói khác, đây là các lựa chọn hiện có:\n\n",
                urgency,
                s.getMealPackage().getName(),
                s.getEndDate(), daysLeft,
                s.getTotalAmount().doubleValue()));

            ctx.suggestedPackages.stream().limit(3).forEach(p ->
                sb.append(String.format("• **%s** – %,.0f VND\n", p.getName(), p.getPrice().doubleValue()))
            );

            return sb.toString();
        }

        StringBuilder sb = new StringBuilder(
            "🔔 Bạn chưa đăng ký gói bữa ăn nào!\n\n" +
            "Đây là một số gợi ý cho bạn:\n\n");

        ctx.suggestedPackages.stream().limit(3).forEach(p ->
            sb.append(String.format("• **%s** – %,.0f VND (%d ngày)\n",
                    p.getName(), p.getPrice().doubleValue(), p.getDurationDays()))
        );

        sb.append("\nĐăng ký ngay để không bỏ lỡ bữa ăn nào nhé! 🍽️");
        return sb.toString();
    }

    private String buildOrderReply(BusinessContext ctx) {
        if (ctx.todayOrders == null || ctx.todayOrders.isEmpty()) {
            return "📦 Không có bữa ăn nào được lên lịch cho bạn hôm nay. " +
                   "Có thể do bạn chưa đăng ký gói hoặc đơn hàng hôm nay chưa được tạo. " +
                   "Hãy kiểm tra gói đăng ký hoặc liên hệ bộ phận hỗ trợ.";
        }

        StringBuilder sb = new StringBuilder("🍽️ Các bữa ăn của bạn hôm nay:\n\n");
        ctx.todayOrders.forEach(o -> {
            String itemName = o.getMenuItem() != null
                    ? o.getMenuItem().getItemName() : "Món ăn trong ngày";
            sb.append(String.format("• **%s** – %s | Trạng thái: **%s**\n",
                    o.getMealType(), itemName, o.getStatus()));
        });

        return sb.toString().trim();
    }

    private String buildGreetingReply(BusinessContext ctx) {
        return """
                👋 Xin chào! Mình là **Trợ lý BudgetBites** 🍱
                
                Mình có thể giúp bạn:
                1. 💰 **Gợi ý bữa ăn** dựa trên ngân sách của bạn
                2. 🥗 **Tư vấn dinh dưỡng** để ăn uống lành mạnh
                3. 🗓️ **Thực đơn tuần** – xem món ăn mỗi ngày
                4. 📋 **Thông tin gói đăng ký** – kiểm tra hoặc gia hạn
                5. 📦 **Đơn hàng hôm nay** – theo dõi bữa ăn của bạn
                
                Đừng ngần ngại hỏi mình nhé! VD: *"Mình có 200k, ăn gì cho rẻ?"*
                """;
    }

    private String buildFallbackReply() {
        return """
                🤔 Mình chưa hiểu ý bạn lắm. Mình có thể giúp bạn các việc sau:
                
                • 💰 Gợi ý gói ăn tiết kiệm – *"Mình có 300k, nên ăn gói nào?"*
                • 🥗 Tư vấn dinh dưỡng – *"Gợi ý món ăn tốt cho sức khỏe"*
                • 🗓️ Thực đơn tuần – *"Hôm nay ăn món gì?"*
                • 📋 Gói đăng ký – *"Kiểm tra trạng thái gói của mình"*
                • 📦 Đơn hàng – *"Hôm nay mình ăn gì thế?"*
                
                Bạn thử đặt câu hỏi khác xem sao nhé!
                """;
    }

    /* ─────────────────────────────────────────────────────────────────
       HELPERS
    ───────────────────────────────────────────────────────────────── */

    private MealPackageDTO toDTO(MealPackage p) {
        MealPackageDTO dto = new MealPackageDTO();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription());
        dto.setPrice(p.getPrice());
        dto.setDurationDays(p.getDurationDays());
        dto.setMealsPerDay(p.getMealsPerDay());
        dto.setPackageType(p.getPackageType().name());
        dto.setImageUrl(p.getImageUrl());
        dto.setActive(p.getActive());
        dto.setCreatedAt(p.getCreatedAt());
        if (p.getPartner() != null) {
            dto.setPartnerId(p.getPartner().getId());
            dto.setPartnerName(p.getPartner().getName());
        }
        return dto;
    }

    /* ─────────────────────────────────────────────────────────────────
       INNER DATA HOLDER
    ───────────────────────────────────────────────────────────────── */

    /** Carries DB data and derived state through one request cycle. */
    private static class BusinessContext {
        Long userId;
        IntentDetector.Intent intent;
        Long budget;
        List<MealPackage> suggestedPackages = new ArrayList<>();
        Subscription activeSubscription;
        List<MenuItem> todayItems;
        List<MenuItem> lowCalorieItems;
        List<MealOrder> todayOrders;
        List<String> actions = new ArrayList<>();
    }
}
