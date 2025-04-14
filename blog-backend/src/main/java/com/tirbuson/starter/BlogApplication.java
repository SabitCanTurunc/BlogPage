package com.tirbuson.starter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;


@ComponentScan("com.tirbuson")
@EntityScan("com.tirbuson")
@EnableJpaRepositories(basePackages = "com.tirbuson")
@SpringBootApplication
public class BlogApplication {

	// --- Ayarlar ---
	// TODO: API Anahtarınızı buraya girin veya ortam değişkeninden okuyun
	// DİKKAT: Gerçek uygulamalarda anahtarı koda gömmeyin! Güvenlik riski oluşturur.
//	private static final String API_KEY = "AIzaSyD5K20epbBXykTykGAdYco0gC52EhSLAsY"; // API Anahtarınız burada
//	private static final String MODEL_NAME = "gemini-1.5-pro-latest"; // Veya "gemini-1.0-pro" vb.
//	private static final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL_NAME + ":streamGenerateContent?key=" + API_KEY + "&alt=sse";
//	// --- Ayarlar Sonu ---

//	private static final ObjectMapper objectMapper = new ObjectMapper(); // JSON işleyici

	public static void main(String[] args) {
		SpringApplication.run(BlogApplication.class, args);
	}

	// Spring Boot'tan bağımsız çalışacak main metodu
//	public static void main(String[] args) {
//		System.out.println("Bu kod Spring dışında bağımsız çalışıyor 🚀");
//		System.out.println("Gemini API Streaming Test Başlatılıyor...");
//		System.out.println("-".repeat(50));
//
//		// API Anahtarını kontrol et (Basit kontrol)
//		if (API_KEY == null || API_KEY.equals("YOUR_API_KEY") || API_KEY.trim().isEmpty() || API_KEY.equals("AIzaSyD5K20epbBXykTykGAdYco0gC52EhSLAsY") ) {
//			// Basit bir kontrol, kendi anahtarınızı girdiğinizden emin olun
//			if (API_KEY.equals("AIzaSyD5K20epbBXykTykGAdYco0gC52EhSLAsY")) {
//				System.err.println("Uyarı: Örnek API anahtarı kullanılıyor. Lütfen kendi anahtarınızla değiştirin.");
//			} else {
//				System.err.println("Hata: Lütfen BlogApplication.java dosyasında geçerli bir API_KEY değerini ayarlayın.");
//				return; // API Anahtarı yoksa programı sonlandır
//			}
//		}
//
//
//		HttpClient client = HttpClient.newHttpClient();
//		// Scanner'ı try-with-resources ile kullanarak otomatik kapanmasını sağla
//		try (Scanner scanner = new Scanner(System.in)) {
//
//			System.out.println("Basit Gemini Chat Bot");
//			System.out.println("Model: " + MODEL_NAME);
//			System.out.println("Çıkmak için 'q' yazın.");
//			System.out.println("-".repeat(50));
//
//			while (true) {
//				System.out.print("\nSiz: ");
//				String userInput = scanner.nextLine();
//
//				if ("q".equalsIgnoreCase(userInput)) {
//					System.out.println("Görüşmek üzere!");
//					break;
//				}
//
//				// İstek gövdesini oluştur (sadece son mesajı gönderiyoruz, geçmiş yok)
//				String requestBody;
//				try {
//					// *** DÜZELTME: Geçersiz JSON'a neden olan yorum satırı kaldırıldı ***
//					requestBody = String.format("""
//                        {
//                            "contents": [{
//                                "role": "user",
//                                "parts": [{
//                                    "text": "%s"
//                                }]
//                            }]
//                        }
//                        """, escapeJsonString(userInput));
//				} catch (Exception e) {
//					System.err.println("JSON istek gövdesi oluşturulurken hata: " + e.getMessage());
//					continue; // Sonraki kullanıcı girdisine geç
//				}
//
//				// HTTP İsteğini oluştur
//				HttpRequest request = HttpRequest.newBuilder()
//						.uri(URI.create(API_URL))
//						.header("Content-Type", "application/json")
//						.POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
//						.build();
//
//				try {
//					// İsteği gönder ve yanıtı InputStream olarak al
//					HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());
//
//					// HTTP Durum Kodunu kontrol et
//					if (response.statusCode() != 200) {
//						handleErrorResponse(response);
//						continue; // Sonraki kullanıcı girdisine geç
//					}
//
//					System.out.print("Bot: "); // Yanıt başlamadan önce etiketi yazdır
//					System.out.flush();       // Etiketin hemen görünmesini sağla
//
//					// Yanıt akışını işle (try-with-resources ile otomatik kapanma)
//					try (InputStream inputStream = response.body();
//						 InputStreamReader inputStreamReader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
//						 BufferedReader reader = new BufferedReader(inputStreamReader)) {
//
//						String line;
//						boolean receivedData = false; // En az bir parça alındı mı?
//						while ((line = reader.readLine()) != null) {
//							// SSE formatı: "data: " ile başlayan satırlar
//							if (line.startsWith("data:")) {
//								String jsonStr = line.substring(5).trim();
//
//								// Boş veri veya bitiş işaretçilerini atla
//								if (jsonStr.isEmpty() || jsonStr.equals("[DONE]")) {
//									continue;
//								}
//
//								try {
//									// JSON parçasını işle
//									JsonNode rootNode = objectMapper.readTree(jsonStr);
//									// Metin parçasını güvenli bir şekilde çıkar
//									JsonNode textNode = rootNode.path("candidates").path(0)
//											.path("content").path("parts").path(0).path("text");
//
//									if (!textNode.isMissingNode()) {
//										String textChunk = textNode.asText();
//										// Metin parçasını yazdır
//										System.out.print(textChunk);
//										// *** FLUSH! Çıktıyı hemen gönder ***
//										System.out.flush();
//										receivedData = true; // Veri alındı
//
//										// Daha doğal görünüm için küçük bir gecikme (isteğe bağlı)
//										try {
//											Thread.sleep(50); // 50 milisaniye
//										} catch (InterruptedException e) {
//											Thread.currentThread().interrupt();
//											System.err.println("\nBekleme kesintiye uğradı.");
//										}
//									} else {
//										// Beklenmeyen JSON yapısı - Güvenlik filtresi tetiklenmiş olabilir
//										JsonNode finishReasonNode = rootNode.path("candidates").path(0).path("finishReason");
//										if (!finishReasonNode.isMissingNode()) {
//											System.err.print("[Yanıt engellendi: " + finishReasonNode.asText() + "]");
//											System.out.flush();
//										} else {
//											// Genel beklenmeyen yapı
//											// System.err.println("\nUyarı: Yanıtta 'text' alanı bulunamadı. JSON: " + jsonStr);
//										}
//									}
//								} catch (Exception e) {
//									System.err.println("\nHata: Yanıt parçası işlenemedi. JSON: '" + jsonStr + "', Hata: " + e.getMessage());
//									// Hatalı parçayı atlayıp devam et
//								}
//							}
//						}
//						// Yanıt bittikten sonra yeni satıra geç (eğer veri alındıysa)
//						if (receivedData) {
//							System.out.println();
//						} else {
//							// Eğer hiç text chunk gelmediyse ama stream başarılı olduysa buraya düşebilir.
//							// Örneğin sadece finishReason geldiyse.
//							System.out.println(" (Yanıt metni alınamadı veya yanıt engellendi)");
//						}
//
//					} // InputStream, Reader otomatik kapanır
//
//				} catch (IOException e) {
//					System.err.println("\nAPI ile iletişim hatası: " + e.getMessage());
//					// Ağ hatası vb. durumunda detaylı loglama yapılabilir
//					e.printStackTrace();
//				} catch (InterruptedException e) {
//					Thread.currentThread().interrupt(); // Kesinti durumunu koru
//					System.err.println("\nAPI isteği kesintiye uğradı: " + e.getMessage());
//				}
//			} // while true döngüsü sonu
//
//		} // Scanner otomatik kapanır
//
//		System.out.println("Program sonlandırıldı.");
//	} // main metodu sonu
//
//
//	// --- Yardımcı Metodlar ---
//
//	// JSON string'leri için basit escape metodu
//	private static String escapeJsonString(String input) {
//		if (input == null) return "";
//		return input.replace("\\", "\\\\")
//				.replace("\"", "\\\"")
//				.replace("\b", "\\b")
//				.replace("\f", "\\f")
//				.replace("\n", "\\n")
//				.replace("\r", "\\r")
//				.replace("\t", "\\t");
//	}
//
//	// Hatalı HTTP yanıtını işlemek için yardımcı metod
//	private static void handleErrorResponse(HttpResponse<InputStream> response) {
//		System.err.print("\nBot: API Hatası (HTTP " + response.statusCode() + ") - ");
//		// Hata mesajını okumayı dene
//		try (InputStream errorStream = response.body()) {
//			String errorBody = new String(errorStream.readAllBytes(), StandardCharsets.UTF_8);
//			// Hata JSON ise daha okunabilir yazdırmayı deneyebiliriz
//			try {
//				JsonNode errorJson = objectMapper.readTree(errorBody);
//				System.err.println(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(errorJson));
//			} catch (Exception jsonEx) {
//				System.err.println(errorBody); // JSON değilse olduğu gibi yazdır
//			}
//		} catch (IOException ioEx) {
//			System.err.println("(Hata yanıtı okunamadı: " + ioEx.getMessage() + ")");
//		}
//		System.out.println(); // Yeni satır
//	}
//	// --- Yardımcı Metodlar Sonu ---

} // BlogApplication sınıfı sonu