package com.backend.copi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class ClockConfig {

    @Bean
    // systemClock: Handles system clock in the current backend workflow.
    public Clock systemClock() {
        return Clock.systemDefaultZone();
    }
}
