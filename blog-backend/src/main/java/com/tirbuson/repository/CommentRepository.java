package com.tirbuson.repository;

import com.tirbuson.model.Comment;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface CommentRepository extends BaseRepository<Comment, Integer> {
    List<Comment> findByPostId(Integer postId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Comment c WHERE c.user.id = :userId")
    void deleteByUserId(Integer userId);
} 