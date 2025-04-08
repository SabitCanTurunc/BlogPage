package com.tirbuson.repository;

import com.tirbuson.model.Highlights;
import com.tirbuson.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HighlightsRepository extends BaseRepository<Highlights, Integer> {
    
    @Query("SELECT h FROM Highlights h WHERE h.user = :user AND h.isActive = true AND h.expiresAt > :now ORDER BY h.highlightDate DESC")
    List<Highlights> findByUserOrderByHighlightDateDesc(@Param("user") User user, @Param("now") LocalDateTime now);
    
    @Query("SELECT COUNT(h) FROM Highlights h WHERE h.user = :user AND h.highlightDate >= :startOfDay AND h.isActive = true AND h.expiresAt > :now")
    long countDailyHighlights(@Param("user") User user, @Param("startOfDay") LocalDateTime startOfDay, @Param("now") LocalDateTime now);
    
    @Query("SELECT h FROM Highlights h WHERE h.user = :user AND h.highlightDate >= :startOfDay AND h.isActive = true AND h.expiresAt > :now ORDER BY h.highlightDate DESC")
    List<Highlights> findDailyHighlights(@Param("user") User user, @Param("startOfDay") LocalDateTime startOfDay, @Param("now") LocalDateTime now);
    
    // Süresi dolmuş olanları listele
    @Query("SELECT h FROM Highlights h WHERE h.expiresAt <= :now AND h.isActive = true")
    List<Highlights> findExpiredHighlights(@Param("now") LocalDateTime now);
    
    // Tüm aktif ve süresi dolmamış highlight'ları getir
    @Query("SELECT h FROM Highlights h WHERE h.isActive = true AND h.expiresAt > :now AND h.highlightDate > :since ORDER BY h.highlightDate DESC")
    List<Highlights> findAllActiveHighlights(@Param("now") LocalDateTime now, @Param("since") LocalDateTime since);
}
