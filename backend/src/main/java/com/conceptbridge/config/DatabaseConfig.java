//package com.conceptbridge.config;
//
//import org.springframework.boot.context.properties.ConfigurationProperties;
//import org.springframework.boot.jdbc.DataSourceBuilder;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.context.annotation.Profile;
//
//import javax.sql.DataSource;
//
//@Configuration
//public class DatabaseConfig {
//
//    @Bean
//    @Profile("dev")
//    @ConfigurationProperties(prefix = "spring.datasource")
//    public DataSource devDataSource() {
//        return DataSourceBuilder.create().build();
//    }
//
//    @Bean
//    @Profile("prod")
//    @ConfigurationProperties(prefix = "spring.datasource")
//    public DataSource prodDataSource() {
//        return DataSourceBuilder.create().build();
//    }
//}