package com.backend.copi.security;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class DummyControllerTest {

    @GetMapping("/")
    public String home() {
        return "ok";
    }

    @GetMapping("/api/test")
    public String api() {
        return "secured";
    }
}