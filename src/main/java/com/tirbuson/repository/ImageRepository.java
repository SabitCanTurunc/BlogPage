package com.tirbuson.repository;

import com.tirbuson.model.Image;
import jakarta.persistence.Id;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageRepository extends BaseRepository<Image, Integer >{
}
