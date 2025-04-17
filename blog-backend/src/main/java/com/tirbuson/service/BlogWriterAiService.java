package com.tirbuson.service;

import com.tirbuson.dto.request.ContentWriterAiRequestDto;
import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.MessageType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@Service
public class BlogWriterAiService {
    private final ChatService chatService;
    private String systemInstruction = "" +
            "Sen, profesyonel bir AI blog yazma asistanısın. Görevin, kullanıcının sağladığı başlık, kategori, hedef kitle, ton ve içerik notlarına dayanarak özgün, SEO dostu, okuyucu odaklı ve yüksek kaliteli blog yazıları üretmek. Aşağıdaki kuralları ve yapıyı takip et:\n" +
            "\n" +
            "**Temel Kurallar:**\n" +
            "1. **Dil Uyumu:** Kullanıcının talebini hangi dilde yazdığını tespit et ve tüm içeriği (yazı, başlıklar, öneriler) tamamen bu dilde üret. Dil tutarlılığı kritik.\n" +
            "2. **Özgünlük:** İçeriğin %100 özgün olduğundan emin ol. İntihal veya kopya içerik asla kullanma.\n" +
            "3. **Profesyonellik:** Dilbilgisi, yazım ve noktalama kurallarına tam uyum sağla. Akıcı, doğal ve hatasız bir dil kullan.\n" +

            "4. **Okuyucu Odaklılık:** Hedef kitleye uygun bir dil ve üslup kullan. Okuyucuya doğrudan hitap et (örneğin, Türkçe için 'sen' veya 'siz'). Samimi ama profesyonel bir ton koru.\n" +
            "5. **Eksik Bilgi Yönetimi:**\n" +
            "   - Başlık, kategori veya anahtar kelime belirtilmemişse, içerik notlarından mantıklı bir başlık, kategori ve anahtar kelimeler türet.\n" +
            "   - Yetersiz bilgi durumunda, konuyu yaratıcı bir şekilde geliştir ve değerli bir içerik üret.\n" +
            "\n" +
            "**Yazı Yapısı:**\n" +
            "- **Başlık :** Kullanıcının baş, yoksa senin önerdiğin SEO dostu bir başlık.\n" +
            "- **Giriş (100-150 kelime):** Konuya kısa bir giriş yap, okuyucunun ilgisini çek, problemi veya konuyu tanıt ve yazının amacını belirt.\n" +
            "- **Ana Bölüm (3-5 alt başlık, H2):** Konuyu detaylandır. Her alt başlık altında:\n" +
            "   - Net bilgi, ipucu veya çözüm sun.\n" +
            "   - Gerekirse örnek, istatistik veya hikaye ekle.\n" +
            "   - Paragraflar kısa ve okunabilir olsun (maks. 4-5 cümle).\n" +
            "- **Sonuç (100 kelime):** Ana noktaları özetle, okuyucuya bir eylem çağrısı (CTA) yap (örneğin, yorum bırakma, paylaşma, uygulama).\n" +
            "- **Ek Çıktılar:**\n" +
            "   - 2-3 alternatif başlık önerisi.\n" +
            "   - Kullanılan anahtar kelimeler ve SEO özeti.\n" +
            "   - Meta açıklama önerisi.\n" +
            "\n" +
            "**Ton ve Stil:**\n" +
            "- Kategoriye göre tonu ayarla:\n" +
            "   - Teknoloji: Bilgilendirici, net, teknik ama anlaşılır.\n" +
            "   - Kişisel Gelişim: Motive edici, samimi, ilham verici.\n" +
            "   - Seyahat: Canlı, betimleyici, hikaye odaklı.\n" +
            "   - [Kullanıcı tarafından belirtilen diğer kategoriler için uyarla].\n" +
            "- Kullanıcı notlarında özel bir ton (örneğin, esprili, ciddi) belirtilmişse, buna öncelik ver.\n" +
            "\n" +
            "**Görev Akışı:**\n" +
            "1. Kullanıcının bir sonraki mesajında vereceği detayları (başlık, kategori, hedef kitle, anahtar kelimeler, notlar) analiz et.\n" +
            "2. Eksik bilgileri tamamla (gerekirse kullanıcıya hangi bilgilerin eksik olduğunu bildir).\n" +
            "3. Yukarıdaki kurallara uygun, belirtilen dilde tam bir blog yazısı üret.\n" +
            "4. Yazının sonunda başlık önerileri ekle.\n" +
            "\n" +
            "**Hedef:**\n" +
            "Kullanıcının girdilerini, hedef kitleye hitap eden, arama motorlarında iyi sıralama alacak ve okuyucuyu bağlayacak bir blog yazısına dönüştür.";



    public BlogWriterAiService(ChatService chatService) {
        this.chatService = chatService;
    }

    public StreamingResponseBody createBlogContent(ContentWriterAiRequestDto requestDto) {
        try {
            if (requestDto == null) {
                throw new BaseException(MessageType.MISSING_REQUIRED_FIELD, "İstek içeriği boş olamaz");
            }
            
            String title = requestDto.getTitle() != null ? requestDto.getTitle() : "";
            String category = requestDto.getCategory() != null ? requestDto.getCategory() : "";
            String content = requestDto.getContent() != null ? requestDto.getContent() : "";
            
            if (title.isEmpty() && category.isEmpty() && content.isEmpty()) {
                throw new BaseException(MessageType.MISSING_REQUIRED_FIELD, "Başlık, kategori veya içerik alanlarından en az biri doldurulmalıdır");
            }
            
            String question = "title:" + title + " category:" + category + " content:" + content;
            
            return outputStream -> {
                try {
                    StreamingResponseBody originalStream = chatService.streamChatWithGeminAi(question, systemInstruction);
                    
                    originalStream.writeTo(outputStream);

                    writeAndFlush(outputStream, "data: \n\n");
                } catch (Exception e) {
                    try {
                        writeAndFlush(outputStream, "data: {\"error\": \"" + e.getMessage() + "\"}\n\n");
                    } catch (IOException ioException) {
                        System.err.println("Hata mesajı gönderilemedi: " + ioException.getMessage());
                    }
                    throw new BaseException(MessageType.EXTERNAL_SERVICE_ERROR, "Blog içeriği oluşturulurken bir hata oluştu: " + e.getMessage());
                } finally {
                    try {
                        SecurityContextHolder.clearContext();
                        
                        outputStream.close();
                    } catch (IOException e) {
                        System.err.println("Stream kapatılırken hata: " + e.getMessage());
                    }
                }
            };
            
        } catch (BaseException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            throw new BaseException(MessageType.EXTERNAL_SERVICE_ERROR, "Blog içeriği oluşturulurken bir hata oluştu: " + e.getMessage());
        }
    }
    
    private void writeAndFlush(OutputStream outputStream, String text) throws IOException {
        outputStream.write(text.getBytes(StandardCharsets.UTF_8));
        outputStream.flush();
    }
}
