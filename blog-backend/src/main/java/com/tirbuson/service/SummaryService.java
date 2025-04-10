package com.tirbuson.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.MessageType;
import com.tirbuson.model.Post;
import com.tirbuson.model.Summary;
import com.tirbuson.repository.SummaryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class SummaryService extends BaseService<Summary, Integer, SummaryRepository> {

    @Value("${GEMINI_API_KEY}")
    private String apiKey;

    private static final String URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";

    private final SummaryRepository repository;
    private final PostService postService;
    private final ObjectMapper objectMapper;

    public SummaryService(SummaryRepository repository, PostService postService) {
        super(repository);
        this.repository = repository;
        this.postService = postService;
        this.objectMapper = new ObjectMapper();
    }

    private String createInputText(Integer postId) {
        try {
            Post post = postService.findById(postId);
            String content = post.getContent();
            
            // Ana JSON düğümünü oluştur
            ObjectNode requestBody = objectMapper.createObjectNode();
            
            // Contents dizisi
            ArrayNode contents = objectMapper.createArrayNode();
            ObjectNode contentItem = objectMapper.createObjectNode();
            contentItem.put("role", "user");
            
            // Parts dizisi
            ArrayNode parts = objectMapper.createArrayNode();
            ObjectNode part = objectMapper.createObjectNode();
            part.put("text", content);
            parts.add(part);
            
            contentItem.set("parts", parts);
            contents.add(contentItem);
            
            // System instruction
            ObjectNode systemInstruction = objectMapper.createObjectNode();
            ArrayNode instructionParts = objectMapper.createArrayNode();
            ObjectNode instructionPart = objectMapper.createObjectNode();
            instructionPart.put("text", "Verilen metni özetle. Ana noktaları ve önemli bilgileri açık ve anlaşılır bir şekilde vurgula. Fazla detaydan kaçınarak yalnızca en temel bilgileri sun. Metnin bağlamını ve tonunu göz önünde bulundur, ancak gereksiz tekrarları ve ayrıntıları hariç tut. Türkçe dilinde net ve sade bir özet oluştur.");
            instructionParts.add(instructionPart);
            systemInstruction.set("parts", instructionParts);
            
            // Generation config
            ObjectNode generationConfig = objectMapper.createObjectNode();
            generationConfig.put("responseMimeType", "text/plain");
            
            // Ana düğüme ekle
            requestBody.set("contents", contents);
            requestBody.set("systemInstruction", systemInstruction);
            requestBody.set("generationConfig", generationConfig);
            
            return objectMapper.writeValueAsString(requestBody);
            
        } catch (Exception e) {
            System.err.println("JSON oluşturma hatası: " + e.getMessage());
            throw new BaseException(MessageType.GENERAL_EXCEPTION + "JSON oluşturma hatası: " + e.getMessage());
        }
    }

    public Summary findByPostId(Integer postId) throws IOException, InterruptedException {
        Summary summary = repository.findByPostId(postId);

        if (summary == null) {
            try {
                HttpClient client = HttpClient.newHttpClient();
                String requestBody = createInputText(postId);
                
                // Debug için
                System.out.println("API İsteği URL: " + URL);
                System.out.println("API Anahtarı uzunluğu: " + (apiKey != null ? apiKey.length() : 0));
                
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(URL + apiKey))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                        .build();

                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                System.out.println("API Yanıt Durum Kodu: " + response.statusCode());

                if (response.statusCode() == 200) {
                    JsonNode rootNode = objectMapper.readTree(response.body());

                    String summarizedText;
                    try {
                        summarizedText = rootNode.path("candidates").get(0)
                                .path("content").path("parts").get(0).path("text").asText();
                    } catch (Exception e) {
                        System.err.println("API yanıtı parse hatası: " + e.getMessage());
                        System.err.println("API yanıtı: " + response.body());
                        throw new BaseException(MessageType.EXTERNAL_SERVICE_ERROR + "API yanıtı parse hatası: " + e.getMessage());
                    }

                    Summary createdSummary = new Summary();
                    Post post = postService.findById(postId);
                    createdSummary.setPost(post);
                    createdSummary.setSummary(summarizedText);
                    repository.save(createdSummary);

                    return createdSummary;
                } else {
                    System.err.println("API Hata Yanıtı: " + response.body());
                    throw new BaseException(MessageType.EXTERNAL_SERVICE_ERROR + 
                        "GeminiAI API hatası (HTTP " + response.statusCode() + "): " + response.body());
                }
            } catch (BaseException e) {
                // Zaten oluşturulmuş istisnayı tekrar fırlat
                throw e;
            } catch (Exception e) {
                System.err.println("Beklenmeyen hata: " + e.getMessage());
                e.printStackTrace();
                throw new BaseException(MessageType.EXTERNAL_SERVICE_ERROR + "GeminiAI API hatası: " + e.getMessage());
            }
        }
        return summary;
    }
}
