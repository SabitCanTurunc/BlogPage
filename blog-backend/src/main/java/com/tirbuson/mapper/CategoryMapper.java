package com.tirbuson.mapper;

import com.tirbuson.dto.request.CategoryRequestDto;
import com.tirbuson.dto.response.CategoryResponseDto;
import com.tirbuson.model.Category;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper implements BaseMapper<Category, CategoryResponseDto,CategoryRequestDto> {


    @Override
    public Category convertToEntity(CategoryRequestDto categoryRequestDto) {
        Category category = new Category();
        if (categoryRequestDto.getName().length() < 3) {
            throw new BadCredentialsException("Name too short");
        }
        category.setName(categoryRequestDto.getName());
        return category;
    }

    @Override
    public CategoryResponseDto convertToDto(Category entity) {
        CategoryResponseDto categoryResponseDto = new CategoryResponseDto();
        categoryResponseDto.setId(entity.getId());
        categoryResponseDto.setName(entity.getName());
        categoryResponseDto.setCreatedAt(entity.getCreatedAt());
        categoryResponseDto.setUpdatedAt(entity.getUpdatedAt());
        return categoryResponseDto;
    }
}
