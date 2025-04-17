package com.tirbuson.controller;

import com.tirbuson.dto.request.ContentWriterAiRequestDto;
import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.MessageType;
import com.tirbuson.service.BlogWriterAiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.util.Map;

@RestController
@RequestMapping("writer-ai")
public class BlogWriterAiController {
    private final BlogWriterAiService blogWriterAiService;

    public BlogWriterAiController(BlogWriterAiService blogWriterAiService) {
        this.blogWriterAiService = blogWriterAiService;
    }

    @PostMapping(value = "/gemini", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @ResponseBody
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StreamingResponseBody> chatWithGeminiAI(@RequestBody ContentWriterAiRequestDto requestMsg) {
        try {
            // Request null check
            if (requestMsg == null) {
                throw new BaseException(MessageType.MISSING_REQUIRED_FIELD, "İstek içeriği boş olamaz");
            }

            // Stream işlemini saran bir wrapper oluştur
            StreamingResponseBody wrappedStream = outputStream -> {
                try {
                    // Asıl stream işlemi
                    StreamingResponseBody originalStream = blogWriterAiService.createBlogContent(requestMsg);
                    originalStream.writeTo(outputStream);
                } finally {
                    // Stream işlemi tamamlandığında veya hata durumunda security context'i temizle
                    SecurityContextHolder.clearContext();
                }
            };

            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_EVENT_STREAM)
                    .header("Cache-Control", "no-cache")
                    .header("Connection", "keep-alive")
                    .header("X-Accel-Buffering", "no")
                    .body(wrappedStream);
        } catch (BaseException e) {
            // BaseException zaten GlobalExceptionHandler tarafından yönetilecek
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            throw new BaseException(MessageType.GENERAL_EXCEPTION, "Blog yazısı oluşturulurken bir hata oluştu: " + e.getMessage());
        }
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception ex) {
        // Hata durumunda da security context'i temizle
        SecurityContextHolder.clearContext();
        
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Blog yazısı oluşturulurken bir hata oluştu: " + ex.getMessage());
    }
}
