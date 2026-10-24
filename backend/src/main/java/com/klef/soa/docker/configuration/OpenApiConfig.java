package com.klef.soa.docker.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Podcast Episode Management API - 2400030188")
                        .version("1.0")
                        .description("REST API Documentation for Podcast Episode CRUD Operations - SOA Docker Assignment")
                        .contact(new Contact()
                                .name("Nischal Singana (2400030188)")
                                .email("singananischal@gmail.com")));
    }
}
