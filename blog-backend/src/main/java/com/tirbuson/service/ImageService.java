package com.tirbuson.service;

import com.tirbuson.model.Image;
import com.tirbuson.repository.ImageRepository;
import org.springframework.stereotype.Service;

@Service
public class ImageService extends BaseService<Image,Integer, ImageRepository> {
    public ImageService(ImageRepository repository) {
        super(repository);
    }
}
