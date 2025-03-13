package com.tirbuson.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name="image")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Image extends BaseEntity  {

    @Column(nullable = false)
    private String url;



}
