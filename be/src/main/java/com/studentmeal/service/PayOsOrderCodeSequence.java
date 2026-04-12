package com.studentmeal.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Issues monotonic PayOS {@code orderCode} values from a PostgreSQL sequence.
 * <p>
 * Compared to random ints + retries: one DB round-trip, no collisions between instances,
 * and no wasted sequence space from PayOS 231 retry loops.
 */
@Component
@RequiredArgsConstructor
public class PayOsOrderCodeSequence {

    private static final String SEQ = "payos_order_code_seq";

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void ensureSequence() {
        jdbcTemplate.execute(
                """
                CREATE SEQUENCE IF NOT EXISTS %s
                    AS INTEGER
                    INCREMENT BY 1
                    MINVALUE 100000000
                    MAXVALUE 2147483647
                    START WITH 400000000
                    CACHE 50
                """.formatted(SEQ));
    }

    public int nextOrderCode() {
        Long n = jdbcTemplate.queryForObject("SELECT nextval('" + SEQ + "')", Long.class);
        if (n == null || n < 1 || n > Integer.MAX_VALUE) {
            throw new IllegalStateException("payos_order_code_seq out of range: " + n);
        }
        return n.intValue();
    }
}
