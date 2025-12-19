//package com.conceptbridge.config;
//
//import org.springframework.ai.openai.OpenAiApi;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//@Configuration
//public class OpenAIConfig {
//
//    @Value("${spring.ai.openai.api-key}")
//    private String apiKey;
//
//    @Bean
//    public OpenAiApi openAiApi() {
//        return new OpenAiApi(apiKey);
//    }
//}