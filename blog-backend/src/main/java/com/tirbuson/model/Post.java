package com.tirbuson.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "post")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Post extends BaseEntity implements Ownable{

    @Column(nullable = false)
    private String title;
    @Column(nullable = false,columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private boolean isPremium = false;

    @ManyToOne(fetch = FetchType.LAZY, cascade= CascadeType.PERSIST)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name="category_id")
    private Category category;

    @OneToMany( cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Image> images= new ArrayList<>();


    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Highlights> highlights;

    @OneToOne(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private Summary summary;

    @Override
    public User getOwner() {
        return user;
    }
}
