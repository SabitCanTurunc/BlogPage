package com.tirbuson.controller;

import com.tirbuson.dto.request.CategoryRequestDto;
import com.tirbuson.dto.response.CategoryResponseDto;
import com.tirbuson.mapper.CategoryMapper;
import com.tirbuson.model.Category;
import com.tirbuson.repository.CategoryRepository;
import com.tirbuson.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/category")
public class CategoryContoller extends BaseController<CategoryService, Category,Integer, CategoryRepository, CategoryResponseDto, CategoryRequestDto, CategoryMapper>{

    private final CategoryMapper mapper;
    private final CategoryService service;

    protected CategoryContoller(CategoryService service, CategoryMapper mapper) {
        super(service, mapper);
        this.mapper = mapper;
        this.service = service;
    }
    
    // Kategori güncelleme özel endpoint
    @Override
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDto> update(@PathVariable Integer id, @RequestBody CategoryRequestDto reqDto) {
        Category entity = mapper.convertToEntity(reqDto);
        entity.setId(id);
        
        // Servis metodunu çağır
        Category updatedEntity = service.update(entity);
        
        CategoryResponseDto dto = mapper.convertToDto(updatedEntity);
        return ResponseEntity.ok(dto);
    }
}
