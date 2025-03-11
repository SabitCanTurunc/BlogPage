package com.tirbuson.model;

import com.tirbuson.model.enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity

@Table(name="user")

@Getter
@Setter
public class User extends BaseEntity {

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;



    @Enumerated(EnumType.STRING)
    private Role role ;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL,orphanRemoval = true)
    private List<Post> posts;

    public User() {
    }

    public User(String username, String password, String email, Role roles) {
        this.username = username;
        this.password = password;
        this.role = roles;
    }


    public User(String username, String password, String email, Role role, List<Post> posts) {
        this.username = username;
        this.password = password;
        this.role = role;
        this.posts = posts;
    }
}
