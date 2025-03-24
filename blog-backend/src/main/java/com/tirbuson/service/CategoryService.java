package com.tirbuson.service;

import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.ErrorMessage;
import com.tirbuson.exception.MessageType;
import com.tirbuson.model.Category;
import com.tirbuson.model.Post;
import com.tirbuson.repository.CategoryRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService extends BaseService<Category,Integer, CategoryRepository> {

    private final CategoryRepository repository;

    public CategoryService(CategoryRepository repository) {
        super(repository);
        this.repository = repository;
    }

    @Override
    public Category save(Category entity) {


        return super.save(entity);
    }

    @Override
    @Transactional
    public Category update(Category entity) {

        Category existingCategory = repository.findById(entity.getId())
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.CATEGORY_NOT_FOUND,entity.getName())));
        

        existingCategory.setName(entity.getName());
        



        return repository.save(existingCategory);
    }
}
