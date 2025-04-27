package com.tirbuson.controller;

import com.tirbuson.dto.request.ImageGenerationRequestDto;
import com.tirbuson.dto.response.ImageResponseDto;
import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.MessageType;
import com.tirbuson.model.User;
import com.tirbuson.model.enums.SubscriptionPlan;
import com.tirbuson.service.BlogAiImageService;
import com.tirbuson.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai-image")
@CrossOrigin(origins = "*")
public class BlogAiImageController {
    private final BlogAiImageService service;
    private final UserService userService;

    public BlogAiImageController(BlogAiImageService service, UserService userService) {
        this.service = service;
        this.userService = userService;
    }

    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ImageResponseDto> create(@RequestBody ImageGenerationRequestDto request) {
        // Kullanıcının abonelik planını kontrol et
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        User user = userService.findByEmail(userEmail);
        
        // Kullanıcının MAX abonelik planına sahip olup olmadığını kontrol et
        if (user.getSubscriptionPlan() != SubscriptionPlan.MAX) {
            throw new BaseException(MessageType.UNAUTHORIZED_ACCESS, "AI Görsel oluşturma özelliği sadece MAX aboneliğine sahip kullanıcılar tarafından kullanılabilir");
        }
        
        ImageResponseDto response = service.createBlogImage(request.getPrompt());
        return ResponseEntity.ok(response);
    }
}
