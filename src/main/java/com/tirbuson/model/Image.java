package com.tirbuson.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name="image")
@Getter
@Setter
public class Image extends BaseEntity {

    @Column(nullable = false)
    private String url;

    public Image() {
    }

    public Image(String url) {
        this.url = url;
    }
}
