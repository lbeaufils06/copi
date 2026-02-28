package com.backend.copi.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Component
@Validated
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Crypto crypto;
    private Mysqldump mysqldump;
    private Pgdump pgdump;
    private Mariadump pgdumpall;
    private Mariadump mariadump;
    private Mongodump mongodump;
    private Backup backup;

    @Getter @Setter
    public static class Crypto {
        private String secret;
    }

    @Getter @Setter
    public static class Mysqldump {
        private String path;
    }

    @Getter @Setter
    public static class Pgdump {
        private String path;
    }

    @Getter @Setter
    public static class Pgdumpall {
        private String path;
    }

    @Getter @Setter
    public static class Mariadump {
        private String path;
    }

    @Getter @Setter
    public static class Mongodump {
        private String path;
    }

    @Getter @Setter
    public static class Backup {
        private String directory;
    }
}