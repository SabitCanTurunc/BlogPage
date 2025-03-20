package com.tirbuson.service;

import com.tirbuson.model.Post;
import com.tirbuson.repository.PostRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PostService extends BaseService<Post,Integer, PostRepository>{
    private final PostRepository repository;
    private final OwnershipService ownershipService;

    public PostService(PostRepository repository, OwnershipService ownershipService) {
        super(repository);
        this.repository = repository;
        this.ownershipService = ownershipService;
    }

    public List<Post> getPostByUserId(int userId) {
        return repository.getPostsByUser_Id(userId);
    }
    
    // Sayfalama ile tüm postları getir
    public Page<Post> getAllPosts(Pageable pageable) {
        return repository.findAll(pageable);
    }
    
    // Sayfalama ile kategori bazında postları getir
    public Page<Post> getPostsByCategory(String categoryName, Pageable pageable) {
        return repository.findByCategory_Name(categoryName, pageable);
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        ownershipService.verifyOwnership(id, repository);
        super.deleteById(id);
    }

    @Override
    @Transactional
    public Post update(Post entity) {
        ownershipService.verifyOwnership((Integer) entity.getId(), repository);
        return super.update(entity);
    }
}
