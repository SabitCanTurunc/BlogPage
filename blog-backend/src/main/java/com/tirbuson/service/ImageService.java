package com.tirbuson.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tirbuson.dto.response.ImageResponseDto;
import com.tirbuson.model.Image;
import com.tirbuson.repository.ImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
        // Dosya adını benzersiz yap
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        
        // Cloudinary'ye yükle
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
                ObjectUtils.asMap(
                        "public_id", "blog/" + fileName,
                        "overwrite", true
                ));
        
        // Cloudinary URL'ini al
        String url = (String) uploadResult.get("secure_url");
        
        // Veritabanına kaydet
        Image image = new Image();
        image.setUrl(url);
        
        Image savedImage = save(image);
        
        // Yanıt oluştur
        ImageResponseDto responseDto = new ImageResponseDto();
        responseDto.setUrl(savedImage.getUrl());
        
        return responseDto;
    }
}
