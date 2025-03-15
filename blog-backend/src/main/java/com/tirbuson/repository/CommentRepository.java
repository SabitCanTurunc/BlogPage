package com.tirbuson.repository;

import com.tirbuson.model.Comment;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends BaseRepository<Comment, Integer> {
    List<Comment> findByPostId(Integer postId);
} 