package com.tirbuson.repository;

import com.tirbuson.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends BaseRepository<Post, Integer> {
    List<Post> getPostsByUser_Id(Integer userId);
    
    // Sayfalama desteği ile postları getirmek için
    Page<Post> findAll(Pageable pageable);
    
    // Kategori bazında postları sayfalama ile getirmek için
    Page<Post> findByCategory_Name(String categoryName, Pageable pageable);
}
