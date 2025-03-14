package com.tirbuson.mapper;

import com.tirbuson.dto.request.PostRequestDto;
import com.tirbuson.dto.response.PostResponseDto;
import com.tirbuson.model.Image;
import com.tirbuson.model.Post;
import com.tirbuson.service.CategoryService;
import com.tirbuson.service.ImageService;
import com.tirbuson.service.UserService;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class PostMapper implements BaseMapper<Post, PostResponseDto, PostRequestDto> {

    private final UserService userService;
    private final CategoryService categoryService;
    private final ImageService imageService;

    public PostMapper(UserService userService, CategoryService categoryService, ImageService imageService) {
        this.userService = userService;
        this.categoryService = categoryService;
        this.imageService = imageService;
    }

    @Override
    public Post convertToEntity(PostRequestDto postRequestDto) {
        Post post = new Post();
        post.setTitle(postRequestDto.getTitle());
        post.setContent(postRequestDto.getContent());
        
        post.setUser(userService.findByEmail(postRequestDto.getUserEmail()));
        post.setCategory(categoryService.findById(postRequestDto.getCategoryId()));
        
        List<Image> images = new ArrayList<>();
        if (postRequestDto.getImages() != null) {
            for (String imageUrl : postRequestDto.getImages()) {
                Image imageEntity = new Image();
                imageEntity.setUrl(imageUrl);
                Image savedImage = imageService.save(imageEntity);
                images.add(savedImage);
            }
        }
        post.setImages(images);

        return post;
    }

    @Override
    public PostResponseDto convertToDto(Post entity) {
        PostResponseDto postResponseDto = new PostResponseDto();
        postResponseDto.setId(entity.getId());
        postResponseDto.setTitle(entity.getTitle());
        postResponseDto.setContent(entity.getContent());
        postResponseDto.setUserEmail(entity.getUser().getEmail());
        postResponseDto.setCategoryId(entity.getCategory().getId());
        postResponseDto.setCategoryName(entity.getCategory().getName());
        
        List<String> imageUrls = new ArrayList<>();
        if (entity.getImages() != null) {
            for (Image image : entity.getImages()) {
                imageUrls.add(image.getUrl());
            }
        }
        postResponseDto.setImages(imageUrls);
        
        return postResponseDto;
    }
}
