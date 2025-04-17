package com.tirbuson.service;

import com.tirbuson.dto.request.ContentWriterAiRequestDto;
import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.MessageType;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@Service
public class BlogWriterAiService {
    private final ChatService chatService;
    private String systemInstruction="Sen yaratıcı ve profesyonel bir blog yazısı oluşturma asistanısın.  \n" +
            "Görevin, kullanıcının verdiği başlık, kategori ve içerik notlarına göre yüksek kaliteli, özgün ve okuyucuyu içine çeken blog yazıları üretmektir.\n" +
            "\n" +
            "Kurallar:\n" +
            "- Yazılar giriş, gelişme ve sonuç şeklinde yapılandırılmalı.\n" +
            "- Anlatım tarzı kategoriye uygun şekilde seçilmeli (örneğin: teknoloji için bilgilendirici, sağlık için motive edici).\n" +
            "- Gerekiyorsa başlığı geliştir veya alternatif başlık öner.\n" +
            "- Yazının SEO açısından güçlü olması için doğal anahtar kelime geçişleri yap.\n" +
            "- Okuyucuya hitap eden, samimi ama profesyonel bir ton kullan.\n" +
            "- Son bölümde okuyucuya soru sormak, tavsiye vermek veya eyleme çağırmak (CTA) tercih edilir.\n" +
            "- Eğer kategori veya başlık verilmemişse, içeriğe göre en uygun olanı sen öner.\n" +
            "\n" +
            "Senin görevin kullanıcı girdilerini analiz edip en iyi yazıyı üretmek. Kullanıcı içeriği bir sonraki mesajda verecek.";


    public BlogWriterAiService(ChatService chatService) {
        this.chatService = chatService;
    }

    public StreamingResponseBody createBlogContent(ContentWriterAiRequestDto requestDto) {
        try {
            // Null kontrolleri yapılıyor
            if (requestDto == null) {
                throw new BaseException(MessageType.MISSING_REQUIRED_FIELD, "İstek içeriği boş olamaz");
            }
            
            String title = requestDto.getTitle() != null ? requestDto.getTitle() : "";
            String category = requestDto.getCategory() != null ? requestDto.getCategory() : "";
            String content = requestDto.getContent() != null ? requestDto.getContent() : "";
            
            // Boş kontrolleri
            if (title.isEmpty() && category.isEmpty() && content.isEmpty()) {
                throw new BaseException(MessageType.MISSING_REQUIRED_FIELD, "Başlık, kategori veya içerik alanlarından en az biri doldurulmalıdır");
            }
            
            String question = "title:" + title + " category:" + category + " content:" + content;
            return chatService.streamChatWithGeminAi(question, systemInstruction);
            
        } catch (BaseException e) {
            // BaseException'ı olduğu gibi ilet
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            // Diğer hatalar için genel exception
            throw new BaseException(MessageType.EXTERNAL_SERVICE_ERROR, "Blog içeriği oluşturulurken bir hata oluştu: " + e.getMessage());
        }
    }
    
    private void writeAndFlush(OutputStream outputStream, String text) throws IOException {
        outputStream.write(text.getBytes(StandardCharsets.UTF_8));
        outputStream.flush();
    }
}
