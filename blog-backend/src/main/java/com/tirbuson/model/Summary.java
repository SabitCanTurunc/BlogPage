package com.tirbuson.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Summary extends BaseEntity {

    @Column(nullable = false,columnDefinition = "TEXT")

    private String summary;

    @OneToOne(fetch=FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;
}
