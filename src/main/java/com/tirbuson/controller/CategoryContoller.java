package com.tirbuson.controller;

import com.tirbuson.dto.request.CategoryRequestDto;
import com.tirbuson.dto.response.CategoryResponseDto;
import com.tirbuson.mapper.BaseMapper;
import com.tirbuson.mapper.CategoryMapper;
import com.tirbuson.model.Category;
import com.tirbuson.repository.CategoryRepository;
import com.tirbuson.service.BaseService;
import com.tirbuson.service.CategoryService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/category")
public class CategoryContoller extends BaseController<CategoryService, Category,Integer, CategoryRepository, CategoryResponseDto, CategoryRequestDto, CategoryMapper>{


    protected CategoryContoller(CategoryService service, CategoryMapper mapper) {
        super(service, mapper);
    }
}
