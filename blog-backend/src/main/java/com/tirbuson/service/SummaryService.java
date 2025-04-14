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
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
    
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.IOException;
import java.util.concurrent.CompletableFuture;

@Service
public class SummaryService extends BaseService<Summary, Integer, SummaryRepository> {

    @Value("${GEMINI_API_KEY}")
    private String apiKey;

    private static final String URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:streamGenerateContent?key=";

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
            String title = post.getTitle();
            
            ObjectNode requestBody = objectMapper.createObjectNode();
            
            ArrayNode contents = objectMapper.createArrayNode();
            ObjectNode contentItem = objectMapper.createObjectNode();
            contentItem.put("role", "user");
            
            ArrayNode parts = objectMapper.createArrayNode();
            ObjectNode part = objectMapper.createObjectNode();
            part.put("text", title + "\n\n" + content);
            parts.add(part);
            
            contentItem.set("parts", parts);
            contents.add(contentItem);
            
            ObjectNode systemInstruction = objectMapper.createObjectNode();
            ArrayNode instructionParts = objectMapper.createArrayNode();
            ObjectNode instructionPart = objectMapper.createObjectNode();
            instructionPart.put("text", "Verilen metni özetle. Ana noktaları ve önemli bilgileri açık ve anlaşılır bir şekilde vurgula. " +
                    "Fazla detaydan kaçınarak yalnızca en temel bilgileri sun. Metnin bağlamını ve tonunu göz önünde bulundur, " +
                    "ancak gereksiz tekrarları ve ayrıntıları hariç tut. Satır boşlukları ve paragraflara dikkat et. " +
                    "Markdown formatı kullanma, düz metin olarak yanıt ver. Asterisk (*), alt tire (_) gibi özel karakterleri olduğu gibi bırak. " +
                    "Türkçe dilinde net ve sade bir özet oluştur. Her seferinde farklı bir bakış açısıyla ve farklı kelimeler kullanarak özetle. " +
                    "Özetin uzunluğu ve yapısı değişebilir, ancak ana fikir ve önemli noktalar korunmalıdır.");
            instructionParts.add(instructionPart);
            systemInstruction.set("parts", instructionParts);
            
            ObjectNode generationConfig = objectMapper.createObjectNode();
            generationConfig.put("responseMimeType", "text/plain");
            generationConfig.put("temperature", 0.7); // Daha yaratıcı yanıtlar için sıcaklık değerini artır
            
            requestBody.set("contents", contents);
            requestBody.set("systemInstruction", systemInstruction);
            requestBody.set("generationConfig", generationConfig);
            
            return objectMapper.writeValueAsString(requestBody);
            
        } catch (Exception e) {
            throw new BaseException(MessageType.GENERAL_EXCEPTION + "JSON oluşturma hatası: " + e.getMessage());
        }
    }

    public Summary findByPostId(Integer postId) {
        Summary summary = repository.findByPostId(postId);

        if (summary == null) {
            try {
                HttpClient client = HttpClient.newHttpClient();
                String requestBody = createInputText(postId);
                
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(URL + apiKey))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                        .build();

                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                
                if (response.statusCode() != 200) {
                    throw new BaseException(MessageType.EXTERNAL_SERVICE_ERROR + 
                        "GeminiAI API hatası (HTTP " + response.statusCode() + "): " + response.body());
                }
                
                JsonNode rootNode = objectMapper.readTree(response.body());
                String summarizedText;
                
                try {
                    summarizedText = rootNode.path("candidates").get(0)
                            .path("content").path("parts").get(0).path("text").asText();
                } catch (Exception e) {
                    throw new BaseException(MessageType.EXTERNAL_SERVICE_ERROR + "API yanıtı parse hatası: " + e.getMessage());
                }

                Post post = postService.findById(postId);
                summary = new Summary(); // Yeni summary nesnesi oluştur
                summary.setPost(post);
                summary.setSummary(summarizedText);
                repository.save(summary);
            } catch (Exception e) {
                if (e instanceof BaseException) {
                    throw (BaseException) e;
                }
                throw new BaseException(MessageType.EXTERNAL_SERVICE_ERROR + "GeminiAI API hatası: " + e.getMessage());
            }
        }
            return summary;
    }

    public Summary regenerateSummary(Integer postId) {
        try {
            Summary existingSummary = repository.findByPostId(postId);
            
            if (existingSummary != null) {
                repository.delete(existingSummary);
            }

            HttpClient client = HttpClient.newHttpClient();
            String requestBody = createInputText(postId);
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(URL + apiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() != 200) {
                throw new BaseException(MessageType.EXTERNAL_SERVICE_ERROR + 
                    "GeminiAI API hatası (HTTP " + response.statusCode() + "): " + response.body());
            }
            
            JsonNode rootNode = objectMapper.readTree(response.body());
            String summarizedText;
            
            try {
                summarizedText = rootNode.path("candidates").get(0)
                        .path("content").path("parts").get(0).path("text").asText();
            } catch (Exception e) {
                throw new BaseException(MessageType.EXTERNAL_SERVICE_ERROR + "API yanıtı parse hatası: " + e.getMessage());
            }

            Post post = postService.findById(postId);
            Summary newSummary = new Summary();
            newSummary.setPost(post);
            newSummary.setSummary(summarizedText);
            repository.save(newSummary);

            return newSummary;
            
        } catch (Exception e) {
            if (e instanceof BaseException) {
                throw (BaseException) e;
            }
            throw new BaseException(MessageType.EXTERNAL_SERVICE_ERROR + "GeminiAI API hatası: " + e.getMessage());
        }
    }


    public StreamingResponseBody streamChatWithAi(String question) throws BaseException {
        return outputStream -> {
            try {
                HttpClient client = HttpClient.newHttpClient();
                String requestBody = String.format("""
                    {
                        "contents": [{
                            "role": "user",
                            "parts": [{
                                "text": "%s"
                            }]
                        }]
                    }
                    """, question);

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(URL + apiKey + "&alt=sse"))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                        .build();

                HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());
                
                if (response.statusCode() != 200) {
                    String errorMessage = new String(response.body().readAllBytes(), StandardCharsets.UTF_8);
                    throw new BaseException("Gemini API Hatası: " + errorMessage);
                }

                try (BufferedReader reader = new BufferedReader(new InputStreamReader(response.body()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (line.startsWith("data:")) {
                            String jsonStr = line.substring(5).trim();
                            if (jsonStr.isEmpty() || jsonStr.equals("[DONE]")) {
                                continue;
                            }
                            
                            JsonNode rootNode = objectMapper.readTree(jsonStr);
                            JsonNode textNode = rootNode.path("candidates").path(0)
                                    .path("content").path("parts").path(0).path("text");
                            
                            if (!textNode.isMissingNode()) {
                                String text = textNode.asText();
                                writeAndFlush(outputStream, "data: " + text + "\n\n");
                            }
                        }
                    }
                }
            } catch (Exception e) {
                throw new BaseException("Gemini API ile iletişim hatası: " + e.getMessage());
            }
        };
    }

    private void writeAndFlush(OutputStream outputStream, String text) throws IOException {
        outputStream.write(text.getBytes(StandardCharsets.UTF_8));
        outputStream.flush();
    }


}
