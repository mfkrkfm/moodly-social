package com.example.moodly_social_api.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;

@Profile("dev")
@Configuration
public class DevH2BypassConfig {

    @Bean
    public WebSecurityCustomizer h2ConsoleBypass() {
        System.out.println(">>> H2 console bypassed – Spring Security completely ignored for /h2-console/**");
        return web -> web.ignoring().requestMatchers("/h2-console/**");
    }
}