package com.tirbuson.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "highlights")
public class Highlights extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "is_seen")
    private boolean isSeen = false;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "highlight_date", nullable = false)
    private LocalDateTime highlightDate;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
//    @Column(name = "image_url")
//    private String imageUrl = "https://placekitten.com/200/300"; // Varsayılan bir değer

    @PrePersist
    protected void onCreate() {
        highlightDate = LocalDateTime.now();
        // Highlight'lar 24 saat sonra otomatik olarak sona erer
        expiresAt = highlightDate.plusHours(24);
    }
}
