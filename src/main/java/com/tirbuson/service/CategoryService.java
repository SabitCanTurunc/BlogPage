package com.tirbuson.service;

import com.tirbuson.model.Category;
import com.tirbuson.repository.BaseRepository;
import com.tirbuson.repository.CategoryRepository;
import org.springframework.stereotype.Service;

@Service
public class CategoryService extends BaseService<Category,Integer, CategoryRepository> {

    public CategoryService(CategoryRepository repository) {
        super(repository);
    }
}
