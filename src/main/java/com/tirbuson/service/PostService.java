package com.tirbuson.service;

import com.tirbuson.model.Post;
import com.tirbuson.repository.PostRepository;
import org.springframework.stereotype.Service;

@Service
public class PostService extends BaseService<Post,Integer, PostRepository>{
    public PostService(PostRepository repository) {
        super(repository);
    }
}
