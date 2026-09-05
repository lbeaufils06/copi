package com.backend.copi.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = ProductionWebConfigTest.TestController.class,
        properties = {
                "COPI_ADMIN_PASSWORD=test-password",
                "MASTER_KEY=test-master-key"
        }
)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("prod")
@Import(ProductionWebConfigTest.TestController.class)
class ProductionWebConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private Environment environment;

    @Test
    void shouldAcceptPostWithExternalOriginInProduction() throws Exception {
        mockMvc.perform(post("/api/test")
                        .header("Host", "internal:8080")
                        .header("Origin", "https://public.example")
                        .header("X-Forwarded-Host", "public.example")
                        .header("X-Forwarded-Port", "443")
                        .header("X-Forwarded-Proto", "https"))
                .andExpect(status().isOk())
                .andExpect(content().string("ok"));
    }

    @Test
    void shouldEnableForwardedHeadersInProduction() {
        assertThat(environment.getProperty("server.forward-headers-strategy"))
                .isEqualTo("framework");
    }

    @RestController
    public static class TestController {

        @PostMapping("/api/test")
        public String test() {
            return "ok";
        }
    }
}
