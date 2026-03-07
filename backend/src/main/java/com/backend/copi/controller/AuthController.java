package com.backend.copi.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    @GetMapping("/api/auth/check")
    // checkAuth: Checks auth and triggers follow-up actions when needed.
    public ResponseEntity<Void> checkAuth() {
        return ResponseEntity.ok().build();
    }
}