package com.studentmeal.service;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Simple keyword-based intent detector.
 *
 * Intents:
 *   BUDGET_MEAL       – user mentions budget / price / how-much
 *   NUTRITION_ADVICE  – user asks about healthy / calories / diet
 *   MENU_QUERY        – user asks what's on the menu this week
 *   SUBSCRIPTION_INFO – user asks about their plan / subscription / renewal
 *   ORDER_INFO        – user asks about today's / current meal / order
 *   GREETING          – hello / hi / hey
 *   UNKNOWN           – fallback
 */
@Component
public class IntentDetector {

    public enum Intent {
        BUDGET_MEAL,
        NUTRITION_ADVICE,
        MENU_QUERY,
        SUBSCRIPTION_INFO,
        ORDER_INFO,
        GREETING,
        UNKNOWN
    }

    /** keyword lists per intent – order matters: more specific first */
    private static final Map<Intent, List<String>> KEYWORD_MAP = Map.of(
            Intent.BUDGET_MEAL, List.of(
                    "budget", "giá", "tiền", "bao nhiêu", "cheap", "affordable",
                    "rẻ", "tiết kiệm", "price", "cost", "spending", "k budget",
                    "nghìn", "đồng", "vnd", "how much", "money", "các gói", "gói ăn",
                    "gói nào", "gói combo", "combo nào"
            ),
            Intent.NUTRITION_ADVICE, List.of(
                    "healthy", "calorie", "calories", "nutrition", "diet", "low-calorie",
                    "low calorie", "ít calo", "dinh dưỡng", "sức khỏe", "vitamin",
                    "protein", "fat", "carb", "vegetarian", "chay", "eat healthy",
                    "balanced", "weight", "macro", "giảm cân", "tăng cân", "calo", "eat-clean"
            ),
            Intent.MENU_QUERY, List.of(
                    "menu", "thực đơn", "this week", "tuần này", "what will i eat",
                    "ăn gì", "món gì", "schedule", "lịch ăn", "weekly", "today's menu",
                    "what's for", "thực đơn tuần"
            ),
            Intent.SUBSCRIPTION_INFO, List.of(
                    "subscription", "subscrib", "plan", "renew", "renewal",
                    "đăng ký", "gia hạn", "expire", "hết hạn", "status", "trạng thái",
                    "upgrade", "my plan", "current plan", "cancel plan", "gói của tôi",
                    "gói hiện tại", "thông tin gói"
            ),
            Intent.ORDER_INFO, List.of(
                    "order", "today", "hôm nay", "meal today", "my meal", "đơn hàng",
                    "bữa ăn", "current order", "tracking", "deliver", "ship", "status order"
            ),
            Intent.GREETING, List.of(
                    "hello", "hi", "hey", "xin chào", "chào", "good morning",
                    "good afternoon", "good evening", "howdy", "sup", "help"
            )
    );

    /**
     * Detect the dominant intent from the raw user message.
     */
    public Intent detect(String message) {
        String lower = message.toLowerCase(Locale.ROOT);

        // Score each intent by how many keywords appear in the message
        Intent best = Intent.UNKNOWN;
        int bestScore = 0;

        for (Map.Entry<Intent, List<String>> entry : KEYWORD_MAP.entrySet()) {
            int score = 0;
            for (String kw : entry.getValue()) {
                if (lower.contains(kw)) score++;
            }
            if (score > bestScore) {
                bestScore = score;
                best = entry.getKey();
            }
        }
        return best;
    }

    /**
     * Extract a numeric budget from the message (rough VND parsing).
     * Supports patterns like "300k", "300,000", "300000", "150 nghìn".
     * Returns null if no budget found.
     */
    public Long extractBudget(String message) {
        String lower = message.toLowerCase(Locale.ROOT);

        // Pattern: digits optionally followed by 'k' or 'nghìn'
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("(\\d[\\d,.]*)\\s*(?:k|nghìn|nghin|000)?")
                .matcher(lower);

        Long budget = null;
        while (m.find()) {
            String numStr = m.group(1).replaceAll("[,.]", "");
            try {
                long val = Long.parseLong(numStr);
                // Heuristic: if value looks like "300" and "k" follows → 300_000
                String suffix = lower.substring(m.end()).trim();
                boolean hasK = m.group(0).toLowerCase().contains("k")
                               || suffix.startsWith("k")
                               || lower.substring(m.start()).contains("k");
                if (hasK && val < 10_000) val *= 1000;
                // Ignore unreasonably small (< 10k) or large values
                if (val >= 10_000 && val <= 10_000_000) {
                    budget = val;
                }
            } catch (NumberFormatException ignored) { }
        }
        return budget;
    }
}
