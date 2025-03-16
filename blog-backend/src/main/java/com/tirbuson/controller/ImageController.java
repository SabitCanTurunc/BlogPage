package com.tirbuson.controller;

import com.tirbuson.dto.request.ImageRequestDto;
import com.tirbuson.dto.response.ImageResponseDto;
import com.tirbuson.mapper.ImageMapper;
import com.tirbuson.model.Image;
import com.tirbuson.repository.ImageRepository;
import com.tirbuson.service.ImageService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/image")
public class ImageController extends BaseController<ImageService, Image,Integer, ImageRepository, ImageResponseDto, ImageRequestDto, ImageMapper>{

    private final ImageService imageService;

    protected ImageController(ImageService service, ImageMapper mapper) {
        super(service, mapper);
        this.imageService = service;
    }
    
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageResponseDto> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        ImageResponseDto response = imageService.uploadImage(file);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping(value = "/upload-multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<ImageResponseDto>> uploadMultipleImages(@RequestParam("files") List<MultipartFile> files) throws IOException {
        List<ImageResponseDto> responses = new ArrayList<>();
        for (MultipartFile file : files) {
            responses.add(imageService.uploadImage(file));
        }
        return ResponseEntity.ok(responses);
    }
}
