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

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URL;
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

    public ImageResponseDto uploadAiImage(String imageUrl) throws IOException {
        String fileName = UUID.randomUUID().toString() + ".jpg";
        File tempFile = File.createTempFile("ai_image_", ".jpg");
        
        try {
            System.out.println("AI Image URL: " + imageUrl);
            
            try {
                URL url = new URL(imageUrl);
                try (BufferedInputStream in = new BufferedInputStream(url.openStream());
                    FileOutputStream fileOutputStream = new FileOutputStream(tempFile)) {
                    byte[] dataBuffer = new byte[1024];
                    int bytesRead;
                    while ((bytesRead = in.read(dataBuffer, 0, 1024)) != -1) {
                        fileOutputStream.write(dataBuffer, 0, bytesRead);
                    }
                    System.out.println("AI Image indirildi, geçici dosya boyutu: " + tempFile.length() + " bytes");
                }
            } catch (IOException e) {
                System.err.println("Hata: AI görselini indirirken hata oluştu: " + e.getMessage());
                e.printStackTrace();
                throw new IOException("AI görselini indirirken hata oluştu: " + e.getMessage());
            }
            
            if (!tempFile.exists() || tempFile.length() == 0) {
                throw new IOException("İndirilen dosya bulunamadı veya boş");
            }
            
            try {
                Map uploadResult = cloudinary.uploader().upload(tempFile,
                        ObjectUtils.asMap(
                                "public_id", "blog/" + fileName,
                                "overwrite", true
                        ));
                
                String cloudinaryUrl = (String) uploadResult.get("secure_url");
                System.out.println("Cloudinary URL: " + cloudinaryUrl);
                
                Image image = new Image();
                image.setUrl(cloudinaryUrl);
                
                Image savedImage = save(image);
                
                ImageResponseDto responseDto = new ImageResponseDto();
                responseDto.setId(savedImage.getId());
                responseDto.setUrl(savedImage.getUrl());
                
                return responseDto;
            } catch (Exception e) {
                System.err.println("Hata: Cloudinary'ye yüklerken hata oluştu: " + e.getMessage());
                e.printStackTrace();
                throw new IOException("Cloudinary'ye yüklerken hata oluştu: " + e.getMessage());
            }
        } finally {
            if (tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

    public void deleteImageFromCloudinary(String imageUrl) {
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
