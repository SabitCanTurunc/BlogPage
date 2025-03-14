package com.tirbuson.controller;

import com.tirbuson.dto.request.ImageRequestDto;
import com.tirbuson.dto.response.ImageResponseDto;
import com.tirbuson.mapper.ImageMapper;
import com.tirbuson.model.Image;
import com.tirbuson.repository.ImageRepository;
import com.tirbuson.service.ImageService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/image")
public class ImageController extends BaseController<ImageService, Image,Integer, ImageRepository, ImageResponseDto, ImageRequestDto, ImageMapper>{


    protected ImageController(ImageService service, ImageMapper mapper) {
        super(service, mapper);
    }
}
