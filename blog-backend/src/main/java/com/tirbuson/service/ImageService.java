package com.tirbuson.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tirbuson.dto.response.ImageResponseDto;
import com.tirbuson.model.Image;
import com.tirbuson.repository.ImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class ImageService extends BaseService<Image,Integer, ImageRepository> {
    
    private final Cloudinary cloudinary;
    
    @Autowired
    public ImageService(ImageRepository repository, Cloudinary cloudinary) {
        super(repository);
        this.cloudinary = cloudinary;
    }
    
    public ImageResponseDto uploadImage(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                        "public_id", "blog/" + fileName,
                        "overwrite", true
                ));
        
        String url = (String) uploadResult.get("secure_url");
        
        Image image = new Image();
        image.setUrl(url);
        
        Image savedImage = save(image);
        
        ImageResponseDto responseDto = new ImageResponseDto();
        responseDto.setId(savedImage.getId());
        responseDto.setUrl(savedImage.getUrl());
        
        return responseDto;
    }

    public void     deleteImageFromCloudinary(String imageUrl) {
        try {
            String publicId = imageUrl.substring(imageUrl.lastIndexOf("/") + 1, imageUrl.lastIndexOf("."));
            cloudinary.uploader().destroy("blog/" + publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        Image image = findById(id);
        if (image != null) {
            deleteImageFromCloudinary(image.getUrl());
            super.deleteById(id);
        }
    }
}
