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
    private final PostRepository postRepository;

    public PostService(PostRepository repository, PostRepository repository1, OwnershipService ownershipService, PostRepository postRepository) {
        super(repository);
        this.repository = repository1;
        this.ownershipService = ownershipService;
        this.postRepository = postRepository;
    }

    public List<Post> getPostByUserId(int userId) {
        return repository.getPostsByUser_Id(userId);
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        ownershipService.verifyOwnership(id, postRepository);
        super.deleteById(id);
    }

    @Override
    @Transactional
    public Post update(Post entity) {
        ownershipService.verifyOwnership((Integer) entity.getId(), postRepository);
        return super.update(entity);
    }


}
