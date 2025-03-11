package com.tirbuson.service;

import com.tirbuson.model.Post;
import com.tirbuson.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService extends BaseService<Post,Integer, PostRepository>{
    private final PostRepository repository;

    public PostService(PostRepository repository, PostRepository repository1) {
        super(repository);
        this.repository = repository1;
    }

    public List<Post> getPostByUserId(int userId) {
        return repository.getPostsByUser_Id(userId);
    }
}
