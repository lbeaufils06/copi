package com.backend.copi.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
public class SessionController {

    @Value("${server.servlet.session.timeout}")
    private Duration sessionTimeout;

    @GetMapping("/api/session/config")
    public ResponseEntity<Long> getSessionTimeout() {
        return ResponseEntity.ok(sessionTimeout.toMillis());
    }
}