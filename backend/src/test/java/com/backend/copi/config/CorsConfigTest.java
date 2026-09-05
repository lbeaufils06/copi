package com.backend.copi.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@WebMvcTest(controllers = CorsConfigTest.TestController.class)
@Import(CorsConfig.class)
@ActiveProfiles("dev")
@AutoConfigureMockMvc(addFilters = false) // 🔥 important
class CorsConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldAllowConfiguredOrigin() throws Exception {
        mockMvc.perform(
                options("/api/test")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET")
        )
        .andExpect(status().isOk())
        .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
        .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    void shouldRejectNonLocalDevelopmentOrigin() throws Exception {
        mockMvc.perform(
                options("/api/test")
                        .header("Origin", "https://public.example")
                        .header("Access-Control-Request-Method", "GET")
        )
        .andExpect(status().isForbidden());
    }

    @RestController
    static class TestController {

        @GetMapping("/api/test")
        public String test() {
            return "ok";
        }
    }
}
