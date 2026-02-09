package com.codex.voidweaver.config;

import okhttp3.OkHttpClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * HTTP Client configuration for AI API calls
 */
@Configuration
public class HttpClientConfig {

    @Bean
    public OkHttpClient okHttpClient() {
        return new OkHttpClient.Builder()
                .connectTimeout(Duration.ofSeconds(30))
                .readTimeout(Duration.ofSeconds(300)) // Deep Thinking需要更长时间
                .writeTimeout(Duration.ofSeconds(60))
                .build();
    }
}
