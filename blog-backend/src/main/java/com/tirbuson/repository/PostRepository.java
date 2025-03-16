package com.tirbuson.repository;

import com.tirbuson.model.Post;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends BaseRepository<Post, Integer> {
    List<Post> getPostsByUser_Id(Integer userId);
}
