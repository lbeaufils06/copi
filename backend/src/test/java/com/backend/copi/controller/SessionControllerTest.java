package com.backend.copi.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SessionController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = {
        "server.servlet.session.timeout=30m"
})
class SessionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnSessionTimeoutInMillis() throws Exception {

        long expectedMillis = Duration.ofMinutes(30).toMillis();

        mockMvc.perform(get("/api/session/config"))
                .andExpect(status().isOk())
                .andExpect(content().string(String.valueOf(expectedMillis)));
    }
}