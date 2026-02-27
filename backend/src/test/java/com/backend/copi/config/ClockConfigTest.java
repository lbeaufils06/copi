package com.backend.copi.config;

import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import java.time.Clock;

import static org.assertj.core.api.Assertions.assertThat;

class ClockConfigTest {

    @Test
    void shouldCreateSystemClockBean() {

        try (AnnotationConfigApplicationContext context =
                     new AnnotationConfigApplicationContext(ClockConfig.class)) {

            Clock clock = context.getBean(Clock.class);

            assertThat(clock).isNotNull();
            assertThat(clock.getZone()).isEqualTo(Clock.systemDefaultZone().getZone());
        }
    }
}