package com.tirbuson.service;

import com.tirbuson.model.Post;
import com.tirbuson.repository.PostRepository;
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
