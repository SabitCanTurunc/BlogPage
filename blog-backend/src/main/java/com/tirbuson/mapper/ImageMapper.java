package com.tirbuson.mapper;

import com.tirbuson.dto.request.ImageRequestDto;
import com.tirbuson.dto.response.ImageResponseDto;
import com.tirbuson.model.Image;
import org.springframework.stereotype.Component;

@Component
public class ImageMapper implements BaseMapper<Image, ImageResponseDto, ImageRequestDto> {
    @Override
    public Image convertToEntity(ImageRequestDto imageRequestDto) {
        Image image = new Image();
        image.setUrl(imageRequestDto.getUrl());

        return image;
    }

    @Override
    public ImageResponseDto convertToDto(Image entity) {
        ImageResponseDto imageResponseDto = new ImageResponseDto();
        imageResponseDto.setUrl(entity.getUrl());
        return imageResponseDto;
    }
}
