package com.tirbuson.service;

import com.tirbuson.model.Post;
import com.tirbuson.model.Category;
import com.tirbuson.model.Image;
import com.tirbuson.repository.PostRepository;
import com.tirbuson.repository.CategoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PostService extends BaseService<Post,Integer, PostRepository>{
    private final PostRepository repository;
    private final OwnershipService ownershipService;
    private final CategoryRepository categoryRepository;
    private final ImageService imageService;

    public PostService(PostRepository repository, OwnershipService ownershipService, CategoryRepository categoryRepository, ImageService imageService) {
        super(repository);
        this.repository = repository;
        this.ownershipService = ownershipService;
        this.categoryRepository = categoryRepository;
        this.imageService = imageService;
    }

    public List<Post> getPostByUserId(int userId) {
        return repository.getPostsByUser_Id(userId);
    }
    
    public Page<Post> getAllPosts(Pageable pageable) {
        return repository.findAll(pageable);
    }
    
    public Page<Post> getPostsByCategory(String categoryName, Pageable pageable) {
        return repository.findByCategory_Name(categoryName, pageable);
    }
    
    public List<String> getAllCategories() {
        try {
            List<Category> categories = categoryRepository.findAll();
            return categories.stream()
                   .map(Category::getName)
                   .sorted()
                   .collect(Collectors.toList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
    
    public List<String> getPopularAuthors() {
        try {
            List<Post> allPosts = repository.findAll();
            
            Map<String, Long> authorPostCounts = allPosts.stream()
                .collect(Collectors.groupingBy(
                    post -> post.getUser().getEmail(),
                    Collectors.counting()
                ));
            
            return authorPostCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
    
    public List<Post> getRecentPosts() {
        try {
            Pageable pageable = PageRequest.of(0, 5, Sort.by("createdAt").descending());
            Page<Post> recentPostsPage = repository.findAll(pageable);
            return recentPostsPage.getContent();
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
    
    public List<Post> searchPosts(String query) {
        try {
            String searchQuery = query.toLowerCase();
            
            List<Post> allPosts = repository.findAll();
            
            return allPosts.stream()
                .filter(post -> 
                    post.getTitle().toLowerCase().contains(searchQuery) || 
                    post.getContent().toLowerCase().contains(searchQuery) ||
                    post.getUser().getEmail().toLowerCase().contains(searchQuery) ||
                    post.getCategory().getName().toLowerCase().contains(searchQuery)
                )
                .collect(Collectors.toList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        ownershipService.verifyOwnership(id, repository);
        Post post = findById(id);
        if (post != null && post.getImages() != null) {
            for (Image image : post.getImages()) {
                imageService.deleteById(image.getId());
            }
            super.deleteById(id);
        }
    }

    @Override
    @Transactional
    public Post update(Post entity) {
        ownershipService.verifyOwnership((Integer) entity.getId(), repository);
        return super.update(entity);
    }
}
