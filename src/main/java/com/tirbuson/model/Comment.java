package com.tirbuson.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "comment")
@Getter
@Setter
public class Comment extends BaseEntity {
    @Column(nullable = false)
    private String comment;

    @Column(nullable = false)
    private Integer postId;

    @Column(nullable = false)
    private Integer userId;

    public Comment() {
    }

    public Comment(String comment, Integer postId, Integer userId) {
        this.comment = comment;
        this.postId = postId;
        this.userId = userId;
    }
}
