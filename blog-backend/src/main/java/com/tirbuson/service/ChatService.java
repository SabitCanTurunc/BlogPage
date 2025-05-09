package com.tirbuson.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tirbuson.dto.chat.ChatMessage;
import com.tirbuson.dto.chat.Part;
import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.MessageType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.*;
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
import java.util.ArrayList;
import java.util.List;

@Service
public class ChatService {
    private final ObjectMapper objectMapper;


    @Value("${GEMINI_API_KEY}")
    private String GEMINI_API_KEY;

    @Value("${OPEN_API_KEY}")
    private String OPEN_API_KEY;

    private static final String URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:streamGenerateContent?key=";

    public ChatService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }


    public StreamingResponseBody streamWithOpenai(String question) {
        return outputStream -> {
            try {
                HttpClient client = HttpClient.newHttpClient();
                String requestBody = String.format("""
                        {
                          "model": "gpt-3.5-turbo",
                          "stream": true,
                          "messages": [
                            {"role": "user", "content": "%s"}
                          ]
                        }
                        """, question);
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                        .header("Content-Type", "application/json")
                        .header("Authorization", "Bearer " + OPEN_API_KEY)
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                        .build();

                HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());

                if (response.statusCode() != 200) {
                    String errorMessage = new String(response.body().readAllBytes(), StandardCharsets.UTF_8);
                    throw new BaseException("Openai API Hatası: " + errorMessage);
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

                            JsonNode contentNode = rootNode.path("choices").get(0).path("delta").path("content");

                            if (!contentNode.isMissingNode() && !contentNode.isNull()) {
                                String text = contentNode.asText();
                                writeAndFlush(outputStream, "data: " + text + "\n\n");
                                System.out.println("data: " + text);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                throw new BaseException("Openai API ile iletişim hatası: " + e.getMessage());
            }


        };
    }

    ArrayList<ChatMessage> chatMessages = new ArrayList<>();

    public StreamingResponseBody streamChatWithGeminAi(String question){
        return streamChatWithGeminAi(question,null);
    }
    public StreamingResponseBody streamChatWithGeminAi(String question,String instruction) throws BaseException         {
        
        return outputStream -> {
            try {
                ArrayList<Part> aiParts = new ArrayList<>();
                ArrayList<Part> userParts = new ArrayList<>();
                ChatMessage aiMessage = new ChatMessage();
                ChatMessage userMessage = new ChatMessage();

                // Soru kontrolü
                if (question == null || question.trim().isEmpty()) {
                    throw new BaseException(MessageType.MISSING_REQUIRED_FIELD, "Soru içeriği boş olamaz");
                }

                Part userPart = new Part();
                userPart.setText(question);

                userMessage.setRole("user");
                userParts.add(userPart);
                userMessage.setParts(userParts);
                chatMessages.add(userMessage);
                
                HttpClient client = HttpClient.newHttpClient();
                
                String requestBody;
                
                if (instruction == null || instruction.trim().isEmpty()) {
                    requestBody = String.format("""
                            {
                                "contents": %s
                            }
                            """, objectMapper.writeValueAsString(chatMessages));
                } else {
                    // Çift tırnakları kaçış karakterleriyle birlikte ekle
                    String safeInstruction = instruction.replace("\"", "\\\"");
                    
                    requestBody = String.format("""
                            {
                                "contents": %s,
                                "systemInstruction": {
                                      "parts": [
                                        {
                                            "text": "%s"
                                        }
                                      ]
                                    }
                            }
                            """, objectMapper.writeValueAsString(chatMessages), safeInstruction);
                }

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(URL + GEMINI_API_KEY + "&alt=sse"))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                        .build();

                HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());

                if (response.statusCode() != 200) {
                    String errorMessage = new String(response.body().readAllBytes(), StandardCharsets.UTF_8);
                    throw new BaseException(MessageType.EXTERNAL_SERVICE_ERROR, "Gemini API Hatası: " + errorMessage);
                }

                //stream yapısı
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(response.body()))) {

                    String line;
                    Part part =new Part();
                    String partText = "";

                    while ((line = reader.readLine()) != null) {
                        if (line.startsWith("data:")) {
                            String jsonStr = line.substring(5).trim();
                            if (jsonStr.isEmpty() || jsonStr.equals("[DONE]")) {
                                continue;
                            }

                            JsonNode rootNode = objectMapper.readTree(jsonStr);
                            JsonNode textNode = rootNode.path("candidates").path(0)
                                    .path("content").path("parts").path(0).path("text");

//                            System.out.println("data: " + textNode.asText());
                            //chat
                            partText = partText + textNode.asText();
                            if (!textNode.isMissingNode()) {
                                String text = textNode.asText();
                                writeAndFlush(outputStream, "data: " + text + "\n\n");
                            }
                        }
                    }

                    part.setText(partText);
                    aiParts.add(part);

                }
                aiMessage.setParts(aiParts);
                aiMessage.setRole("model");
                chatMessages.add(aiMessage);
                

            } catch (Exception e) {
                throw new BaseException("Gemini API ile iletişim hatası: " + e.getMessage());
            }
            System.out.println( objectMapper.writeValueAsString(chatMessages));

        };
    }

    private void writeAndFlush(OutputStream outputStream, String text) throws IOException {
        outputStream.write(text.getBytes(StandardCharsets.UTF_8));
        outputStream.flush();
    }


}
