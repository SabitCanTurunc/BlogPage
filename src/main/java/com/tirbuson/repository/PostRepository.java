package com.tirbuson.repository;

import com.tirbuson.model.Post;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends BaseRepository<Post, Integer> {
}
