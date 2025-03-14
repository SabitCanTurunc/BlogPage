package com.tirbuson.mapper;

import com.tirbuson.dto.request.CategoryRequestDto;
import com.tirbuson.dto.response.CategoryResponseDto;
import com.tirbuson.model.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper implements BaseMapper<Category, CategoryResponseDto,CategoryRequestDto> {


    @Override
    public Category convertToEntity(CategoryRequestDto categoryRequestDto) {
        Category category = new Category();
        category.setName(categoryRequestDto.getName());
        return category;
    }

    @Override
    public CategoryResponseDto convertToDto(Category entity) {
        CategoryResponseDto categoryResponseDto = new CategoryResponseDto();
        categoryResponseDto.setName(entity.getName());
        return categoryResponseDto;
    }
}
