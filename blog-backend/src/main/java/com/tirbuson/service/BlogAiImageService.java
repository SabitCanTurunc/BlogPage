package com.tirbuson.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tirbuson.dto.response.ImageResponseDto;
import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.MessageType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class BlogAiImageService {

    @Value("${OPEN_API_KEY}")
    private String OPEN_API_KEY;
    
    private final ObjectMapper objectMapper;
    
    public BlogAiImageService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public ImageResponseDto createBlogImage(String inputText) {
        try {
            if (inputText == null || inputText.trim().isEmpty()) {
                throw new BaseException(MessageType.MISSING_REQUIRED_FIELD, "Görsel üretmek için bir metin girmelisiniz");
            }
            
            HttpClient client = HttpClient.newHttpClient();
            String requestBody = String.format("""
                    {
                      "model": "dall-e-3",
                      "prompt": "İllüstratif bir blog kapağı oluştur: %s",
                      "n": 1,
                      "size": "1792x1024"
                    }
                    """, inputText);
                    
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/images/generations"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + OPEN_API_KEY)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            
            // HTTP durum kodunu kontrol et
            if (response.statusCode() != 200) {
                String errorMessage = "OpenAI API Hatası: " + response.body();
                throw new BaseException(MessageType.EXTERNAL_SERVICE_ERROR, errorMessage);
            }
            
            // Response JSON'ı parse et
            JsonNode rootNode = objectMapper.readTree(response.body());
            JsonNode dataNode = rootNode.path("data").get(0);
            
            if (dataNode == null || dataNode.path("url").isMissingNode()) {
                throw new BaseException(MessageType.EXTERNAL_SERVICE_ERROR, "OpenAI API'den geçerli bir görsel URL'i alınamadı");
            }
            
            String imageUrl = dataNode.path("url").asText();
            
            // Response dto'yu oluştur
            ImageResponseDto responseDto = new ImageResponseDto();
            responseDto.setUrl(imageUrl);
            
            return responseDto;
            
        } catch (BaseException e) {
            throw e;
        } catch (Exception e) {
            String errorMessage = "Blog görseli oluşturulurken bir hata oluştu: " + e.getMessage();
            throw new BaseException(MessageType.EXTERNAL_SERVICE_ERROR, errorMessage);
        }
    }
}
