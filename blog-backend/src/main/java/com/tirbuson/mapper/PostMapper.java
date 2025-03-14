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

    public PostMapper(UserService userService, CategoryService categoryService, ImageService imageService, ImageService imageService1) {
        this.userService = userService;
        this.categoryService = categoryService;
        this.imageService = imageService1;
    }

    @Override
    public Post convertToEntity(PostRequestDto postRequestDto) {
        Post post = new Post();
        post.setTitle(postRequestDto.getTitle());
        post.setContent(postRequestDto.getContent());
        post.setUser(userService.findById((Integer) postRequestDto.getUserId()));
        post.setCategory(categoryService.findById((Integer) postRequestDto.getCategoryId()));
        List<Image> images = new ArrayList<>();
        for (String image : postRequestDto.getImages()) {
            Image imageEntity = new Image();
            imageEntity.setUrl(image);
            Image savedImage=imageService.save(imageEntity);
            images.add(savedImage);
        }
        post.setImages(images);

        return post;
    }

    @Override
    public PostResponseDto convertToDto(Post entity) {
        PostResponseDto postResponseDto = new PostResponseDto();
        postResponseDto.setTitle(entity.getTitle());
        postResponseDto.setContent(entity.getContent());
        postResponseDto.setUserId(entity.getUser().getId());
        postResponseDto.setCategoryId(entity.getCategory().getId());
        List<String> images = new ArrayList<>();
        for (Image image : entity.getImages()) {
            images.add(image.getUrl());
        }
        postResponseDto.setImages(images);
        return postResponseDto;
    }
}
