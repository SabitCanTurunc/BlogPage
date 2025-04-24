package com.tirbuson.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfiguration(AuthenticationProvider authenticationProvider, 
                                JwtAuthenticationFilter jwtAuthenticationFilter)
                                {
        this.authenticationProvider = authenticationProvider;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Value("${FRONTEND_URL}")
    private String frontendUrl;
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/auth/**", "/verify", "/resend", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/user/update-password", "/user/update-profile").permitAll()
                        .requestMatchers("/user/profile").authenticated()
                        .requestMatchers("/user/profile/{email}").permitAll()
                        .requestMatchers("/user/delete-profile-image").authenticated()
                        .requestMatchers("/user/update-subscription-plan").permitAll()

                        .requestMatchers(HttpMethod.GET, "/post/**", "/category/**", "/comment/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/post/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/post/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/post/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/comment/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/comment/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/comment/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/category/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/category/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/category/**").hasRole("ADMIN")
                        .requestMatchers("/highlights/public").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/highlights/{highlightId}/seen").permitAll()
                        .requestMatchers("/highlights/user/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/highlights/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/highlights/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/summary/getByPostId/{postId}").permitAll()
                        .requestMatchers(HttpMethod.POST, "/summary/regenerate/{postId}").permitAll()
                        .requestMatchers(HttpMethod.POST, "/chat/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/writer-ai/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/ai-image/**").authenticated()

                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200", "http://localhost:4000", "http://localhost:3000", frontendUrl));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}