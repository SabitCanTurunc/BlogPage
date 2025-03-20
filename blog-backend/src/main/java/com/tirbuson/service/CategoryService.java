package com.tirbuson.service;

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

        if (entity.getName().length() < 3) {
            throw new BadCredentialsException("Name too short");
        }
        return super.save(entity);
    }

    @Override
    @Transactional
    public Category update(Category entity) {
        // Mevcut kategoriyi ve ona bağlı postları al
        Category existingCategory = repository.findById(entity.getId())
                .orElseThrow(() -> new RuntimeException("Kategori bulunamadı: " + entity.getId()));
        
        // Post-kategori ilişkisini koru
        List<Post> posts = existingCategory.getPosts();
        
        // Kategori adını güncelle
        existingCategory.setName(entity.getName());
        
        // Kategoriyi veritabanına kaydet
        Category updatedCategory = repository.save(existingCategory);
        
        // Log - Debug için kullanışlı
        if (posts != null) {
            System.out.println("Kategori güncellendi: " + updatedCategory.getName() + ", post sayısı: " + posts.size());
        }
        
        return updatedCategory;
    }
}
