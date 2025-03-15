package com.tirbuson.repository;

import com.tirbuson.model.Post;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface PostRepository extends BaseRepository<Post, Integer> {
    List<Post> getPostsByUser_Id(Integer userId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Post p WHERE p.user.id = :userId")
    void deleteByUserId(Integer userId);
}
