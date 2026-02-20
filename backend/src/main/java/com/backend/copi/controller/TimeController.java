package com.backend.copi.controller;

import java.time.Clock;
import java.time.LocalDateTime;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class TimeController {

    private final Clock clock;

    @GetMapping("/api/time")
    public LocalDateTime getServerTime() {
        return LocalDateTime.now(clock);
    }
}