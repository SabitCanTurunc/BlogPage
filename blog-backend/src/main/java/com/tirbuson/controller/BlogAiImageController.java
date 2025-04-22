package com.tirbuson.controller;

import com.tirbuson.dto.request.ImageGenerationRequestDto;
import com.tirbuson.dto.response.ImageResponseDto;
import com.tirbuson.service.BlogAiImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai-image")
@CrossOrigin(origins = "*")
public class BlogAiImageController {
    private final BlogAiImageService service;

    public BlogAiImageController(BlogAiImageService service) {
        this.service = service;
    }

    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ImageResponseDto> create(@RequestBody ImageGenerationRequestDto request) {
        ImageResponseDto response = service.createBlogImage(request.getPrompt());
        return ResponseEntity.ok(response);
    }
}
