package com.backend.copi;

import org.junit.jupiter.api.Test;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class CopiApplicationTest {

    @Test
    void contextLoads() {
        // Test vide : si le contexte démarre, le test passe
    }
}