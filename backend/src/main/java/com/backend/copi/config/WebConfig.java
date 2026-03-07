package com.backend.copi.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    // addViewControllers: Handles add view controllers in the current backend workflow.
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/{spring:[^\\.]*}")
                .setViewName("forward:/index.html");

        registry.addViewController("/**/{spring:[^\\.]*}")
                .setViewName("forward:/index.html");
    }
}