package com.backend.copi.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;

import static org.assertj.core.api.Assertions.assertThat;

class AppPropertiesTest {

    private final ApplicationContextRunner contextRunner =
            new ApplicationContextRunner()
                    .withUserConfiguration(TestConfig.class)
                    .withPropertyValues(
                            "app.crypto.secret=test",
                            "app.mysqldump.path=/bin/mysql",
                            "app.pgdump.path=/bin/pg_dump",
                            "app.pgdumpall.path=/bin/pg_dumpall",
                            "app.backup.directory=/tmp/backups"
                    );

    @Test
    void shouldBindProperties() {
        contextRunner.run(context -> {
            AppProperties props = context.getBean(AppProperties.class);

            assertThat(props.getCrypto()).isNotNull();
            assertThat(props.getCrypto().getSecret()).isEqualTo("test");
            assertThat(props.getBackup().getDirectory()).isEqualTo("/tmp/backups");
        });
    }

    @Configuration
    @EnableConfigurationProperties(AppProperties.class)
    static class TestConfig {
    }
}