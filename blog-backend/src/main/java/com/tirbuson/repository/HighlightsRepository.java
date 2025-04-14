package com.tirbuson.repository;

import com.tirbuson.model.Highlights;
import com.tirbuson.model.Post;
import com.tirbuson.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HighlightsRepository extends BaseRepository<Highlights, Integer> {
    
    List<Highlights> findByUserAndIsActiveTrueAndUpdatedAtAfterOrderByUpdatedAtDesc(User user, LocalDateTime since);
    
    long countByUserAndUpdatedAtGreaterThanEqualAndIsActiveTrue(User user, LocalDateTime startOfDay);
    
    List<Highlights> findByUserAndUpdatedAtGreaterThanEqualAndIsActiveTrueOrderByUpdatedAtDesc(User user, LocalDateTime startOfDay);
    
    List<Highlights> findByUpdatedAtLessThanEqualAndIsActiveTrue(LocalDateTime expiryDate);
    
    List<Highlights> findByIsActiveTrueAndUpdatedAtAfterOrderByUpdatedAtDesc(LocalDateTime since);

    Optional<Highlights> findFirstByUserAndPostOrderByUpdatedAtDesc(User user, Post post);

    // Admin için yeni metodlar
    long countByIsActiveTrue();
    
    long countByUpdatedAtAfter(LocalDateTime date);
}
