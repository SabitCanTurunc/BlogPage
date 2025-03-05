package com.tirbuson.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "post")
@Getter
@Setter

public class Post extends BaseEntity {

    @Column(nullable = false)
    private String title;
    @Column(nullable = false)
    private String content;


    @ManyToOne(fetch = FetchType.LAZY, cascade= CascadeType.PERSIST)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name="category_id")
    private Category category;

    @OneToMany
    private List<Image> images= new ArrayList<>();


    @OneToMany
    private List<Comment> comments;


    public Post(String title, String content, User user, Category category, List<Image> images, List<Comment> comments) {
        this.title = title;
        this.content = content;
        this.user = user;
        this.category = category;
        this.images = images;
        this.comments = comments;
    }




    public Post() {
    }


}
