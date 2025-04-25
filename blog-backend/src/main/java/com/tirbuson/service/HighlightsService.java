package com.tirbuson.service;

import com.tirbuson.dto.request.HighlightRequestDto;
import com.tirbuson.dto.response.HighlightResponseDto;
import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.MessageType;
import com.tirbuson.mapper.HighlightMapper;
import com.tirbuson.model.Highlights;
import com.tirbuson.model.Post;
import com.tirbuson.model.User;
import com.tirbuson.model.enums.SubscriptionPlan;
import com.tirbuson.repository.HighlightsRepository;
import com.tirbuson.repository.PostRepository;
import com.tirbuson.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class HighlightsService extends BaseService<Highlights,Integer,HighlightsRepository> {

    private final HighlightsRepository highlightsRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final HighlightMapper highlightMapper;
    
    private static final int ESSENTIAL_DAILY_HIGHLIGHT_LIMIT = 1;
    private static final int PLUS_DAILY_HIGHLIGHT_LIMIT = 2;

    public HighlightsService(HighlightsRepository repository, HighlightsRepository highlightsRepository, UserRepository userRepository, PostRepository postRepository, HighlightMapper highlightMapper) {
        super(repository);
        this.highlightsRepository = highlightsRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.highlightMapper = highlightMapper;
    }

    /**
     * Süresi dolmuş highlight'ları filtreleyerek, aktif olmayanları işaretleyen yardımcı metod
     * @param highlights Highlight listesi
     */
    private List<Highlights> filterExpiredHighlights(List<Highlights> highlights) {
        LocalDateTime now = LocalDateTime.now();
        return highlights.stream()
                .map(highlight -> {
                    // Eğer expiresAt süresi dolmuşsa highlight'ı inactive olarak işaretle
                    if (highlight.isActive() && highlight.getExpiresAt() != null && highlight.getExpiresAt().isBefore(now)) {
                        highlight.setActive(false);
                        highlightsRepository.save(highlight);
                    }
                    return highlight;
                })
                .filter(Highlights::isActive) // Sadece aktif olanları filtrele
                .collect(Collectors.toList());
    }

    @Transactional
    public HighlightResponseDto createHighlight(Integer userId, HighlightRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(MessageType.USER_NOT_FOUND));
                
        Post post = postRepository.findById(requestDto.getPostId())
                .orElseThrow(() -> new BaseException(MessageType.POST_NOT_FOUND));

        // Önce süresi dolmuş highlight'ları kontrol et
        List<Highlights> userHighlights = highlightsRepository.findByUser(user);
        filterExpiredHighlights(userHighlights);
        
        // Kullanıcının abonelik planına göre günlük limit kontrolü
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.with(LocalTime.MIN);
        long dailyCount = highlightsRepository.countByUserAndUpdatedAtGreaterThanEqualAndIsActiveTrue(user, startOfDay);
        
        // Abonelik planı kontrolü - MAX planı için logla
        if (user.getSubscriptionPlan() == SubscriptionPlan.MAX) {
            System.out.println("MAX plan kullanıcısı (ID: " + userId + ") highlight oluşturuyor. Günlük count: " + dailyCount);
        }
        
        // Abonelik planına göre limit kontrolü
        if (user.getSubscriptionPlan() == null || user.getSubscriptionPlan() == SubscriptionPlan.ESSENTIAL) {
            // ESSENTIAL: 1 highlight
            if (dailyCount >= ESSENTIAL_DAILY_HIGHLIGHT_LIMIT) {
                throw new BaseException(MessageType.DAILY_HIGHLIGHT_LIMIT_EXCEEDED, 
                    "Essential: günlük limit 1 post.");
            }
        } else if (user.getSubscriptionPlan() == SubscriptionPlan.PLUS) {
            // PLUS: 2 highlight
            if (dailyCount >= PLUS_DAILY_HIGHLIGHT_LIMIT) {
                throw new BaseException(MessageType.DAILY_HIGHLIGHT_LIMIT_EXCEEDED,
                    "Plus: günlük limit 2 post.");
            }
        }
        // MAX kullanıcılar için limit kontrolü yok (sınırsız)

        // Post'un daha önce highlight edilip edilmediğini kontrol et
        Highlights existingHighlight = highlightsRepository.findFirstByUserAndPostOrderByUpdatedAtDesc(user, post)
                .orElse(null);

        if (existingHighlight != null) {
            // Eğer pasif ise aktif hale getir
            if (!existingHighlight.isActive()) {
                existingHighlight.setActive(true);
                existingHighlight.setSeen(false);
                // Yeni bir süre tanımla
                existingHighlight.setExpiresAt(LocalDateTime.now().plusHours(24));
                Highlights updatedHighlight = highlightsRepository.save(existingHighlight);
                return highlightMapper.convertToDto(updatedHighlight);
            } else {
                throw new BaseException(MessageType.HIGHLIGHT_ALREADY_EXISTS);
            }
        }

        // Yeni highlight oluştur
        Highlights highlight = new Highlights();
        highlight.setUser(user);
        highlight.setPost(post);
        highlight.setSeen(false);
        highlight.setActive(true);
        highlight.setHighlightDate(LocalDateTime.now());
        highlight.setExpiresAt(LocalDateTime.now().plusHours(24));
        
        Highlights savedHighlight = highlightsRepository.save(highlight);
        return highlightMapper.convertToDto(savedHighlight);
    }

    @Transactional(readOnly = true)
    public List<HighlightResponseDto> getUserHighlights(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(MessageType.USER_NOT_FOUND));
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        
        // Önce aktif highlight'ları çek ve süresi dolmuşları işaretle
        List<Highlights> highlights = highlightsRepository.findByUserAndIsActiveTrueAndUpdatedAtAfterOrderByUpdatedAtDesc(user, sevenDaysAgo);
        highlights = filterExpiredHighlights(highlights);
        
        return highlights.stream()
                .map(highlightMapper::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HighlightResponseDto> getDailyHighlights(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(MessageType.USER_NOT_FOUND));
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.with(LocalTime.MIN);
        
        // Önce aktif highlight'ları çek ve süresi dolmuşları işaretle
        List<Highlights> highlights = highlightsRepository.findByUserAndUpdatedAtGreaterThanEqualAndIsActiveTrueOrderByUpdatedAtDesc(user, startOfDay);
        highlights = filterExpiredHighlights(highlights);
        
        return highlights.stream()
                .map(highlightMapper::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteHighlight(Integer userId, Integer highlightId) {
        Highlights highlight = highlightsRepository.findById(highlightId)
                .orElseThrow(() -> new BaseException(MessageType.HIGHLIGHT_NOT_FOUND));
                
        if (!highlight.getUser().getId().equals(userId)) {
            throw new BaseException(MessageType.NOT_HIGHLIGHT_OWNER);
        }
        
        highlight.setActive(false);
        highlightsRepository.save(highlight);
    }

    @Transactional
    public HighlightResponseDto markAsSeen(Integer highlightId) {
        Highlights highlight = highlightsRepository.findById(highlightId)
                .orElseThrow(() -> new BaseException(MessageType.HIGHLIGHT_NOT_FOUND));
        
        // Süre kontrolü
        if (highlight.getExpiresAt() != null && highlight.getExpiresAt().isBefore(LocalDateTime.now())) {
            highlight.setActive(false);
            highlightsRepository.save(highlight);
            throw new BaseException(MessageType.HIGHLIGHT_NOT_FOUND);
        }
        
        if (!highlight.isActive()) {
            throw new BaseException(MessageType.HIGHLIGHT_NOT_FOUND);
        }
                
        highlight.setSeen(true);
        Highlights updatedHighlight = highlightsRepository.save(highlight);
        return highlightMapper.convertToDto(updatedHighlight);
    }
    
    /**
     * Süresi dolmuş highlight'ları her gün gece yarısı pasif hale getirir
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void deactivateExpiredHighlights() {
        LocalDateTime now = LocalDateTime.now();
        
        // Tüm aktif highlight'ları çek
        List<Highlights> activeHighlights = highlightsRepository.findByIsActiveTrue();
        
        // expiresAt alanına göre süreleri dolmuş highlight'ları işaretle
        for (Highlights highlight : activeHighlights) {
            if (highlight.getExpiresAt() != null && highlight.getExpiresAt().isBefore(now)) {
                highlight.setActive(false);
                highlightsRepository.save(highlight);
            }
        }
        
        // Eski highlight'ları da temizleyelim (7 günden eski)
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        List<Highlights> oldHighlights = highlightsRepository.findByUpdatedAtLessThanEqualAndIsActiveTrue(sevenDaysAgo);
        for (Highlights highlight : oldHighlights) {
            highlight.setActive(false);
            highlightsRepository.save(highlight);
        }
    }

    @Transactional(readOnly = true)
    public List<HighlightResponseDto> getAllHighlights() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        
        List<Highlights> highlights = highlightsRepository.findByIsActiveTrueAndUpdatedAtAfterOrderByUpdatedAtDesc(sevenDaysAgo);
        highlights = filterExpiredHighlights(highlights);
                
        return highlights.stream()
                .map(highlightMapper::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Tüm aktif öne çıkarılmış içerikleri getirir
     * Bu metot tüm kullanıcılar için erişilebilir
     * @return Aktif öne çıkarılmış içeriklerin listesi
     */
    public List<HighlightResponseDto> getAllActiveHighlights() {
        // Son 7 günde güncellenen ve aktif olan highlight'ları getir
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        
        List<Highlights> activeHighlights = highlightsRepository.findByIsActiveTrueAndUpdatedAtAfterOrderByUpdatedAtDesc(sevenDaysAgo);
        activeHighlights = filterExpiredHighlights(activeHighlights);
        
        return activeHighlights.stream()
                .map(highlightMapper::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public HighlightResponseDto toggleHighlightStatus(Integer highlightId) {
        Highlights highlight = highlightsRepository.findById(highlightId)
                .orElseThrow(() -> new BaseException(MessageType.HIGHLIGHT_NOT_FOUND));
        
        // Süre kontrolü yap
        if (highlight.getExpiresAt() != null && highlight.getExpiresAt().isBefore(LocalDateTime.now())) {
            highlight.setActive(false);
            Highlights updatedHighlight = highlightsRepository.save(highlight);
            return highlightMapper.convertToDto(updatedHighlight);
        }
        
        highlight.setActive(!highlight.isActive());
        // Eğer aktifleştiriliyorsa süreyi yenile
        if (highlight.isActive()) {
            highlight.setExpiresAt(LocalDateTime.now().plusHours(24));
        }
        Highlights updatedHighlight = highlightsRepository.save(highlight);
        return highlightMapper.convertToDto(updatedHighlight);
    }

    @Transactional
    public void deleteHighlightAdmin(Integer highlightId) {
        Highlights highlight = highlightsRepository.findById(highlightId)
                .orElseThrow(() -> new BaseException(MessageType.HIGHLIGHT_NOT_FOUND));
        
        highlightsRepository.delete(highlight);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getHighlightStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Tüm aktif highlight'ları güncelle önce
        List<Highlights> activeHighlights = highlightsRepository.findByIsActiveTrue();
        filterExpiredHighlights(activeHighlights);
        
        // Toplam highlight sayısı
        long totalHighlights = highlightsRepository.count();
        stats.put("totalHighlights", totalHighlights);
        
        // Aktif highlight sayısı
        long activeHighlightCount = highlightsRepository.countByIsActiveTrue();
        stats.put("activeHighlights", activeHighlightCount);
        
        // Son 7 gündeki highlight sayısı
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        long recentHighlights = highlightsRepository.countByUpdatedAtAfter(sevenDaysAgo);
        stats.put("recentHighlights", recentHighlights);
        
        // Günlük ortalama highlight sayısı
        double dailyAverage = (double) recentHighlights / 7;
        stats.put("dailyAverage", dailyAverage);
        
        return stats;
    }

    /**
     * MAX kullanıcılar için tüm highlight'ları getir (debug için)
     * @param userId Kullanıcı ID
     * @return MAX kullanıcının tüm highlight'ları ve ilgili bilgiler
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getMaxUserDebugInfo(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(MessageType.USER_NOT_FOUND));
        
        if (user.getSubscriptionPlan() != SubscriptionPlan.MAX) {
            throw new BaseException(MessageType.UNAUTHORIZED_ACCESS, "Bu işlem sadece MAX abonelik için kullanılabilir");
        }
        
        Map<String, Object> debugInfo = new HashMap<>();
        debugInfo.put("userId", userId);
        debugInfo.put("email", user.getEmail());
        debugInfo.put("subscriptionPlan", user.getSubscriptionPlan().toString());
        
        // Tüm highlight'ları getir
        List<Highlights> allHighlights = highlightsRepository.findByUser(user);
        
        // Günlük highlight'ları getir
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
        long dailyCount = highlightsRepository.countByUserAndUpdatedAtGreaterThanEqualAndIsActiveTrue(user, startOfDay);
        
        // Son 7 günlük highlight'ları getir
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        long recentHighlights = highlightsRepository.countByUserAndUpdatedAtGreaterThanEqualAndIsActiveTrue(user, sevenDaysAgo);
        
        debugInfo.put("totalHighlightCount", allHighlights.size());
        debugInfo.put("activeHighlightCount", allHighlights.stream().filter(Highlights::isActive).count());
        debugInfo.put("dailyHighlightCount", dailyCount);
        debugInfo.put("last7DaysHighlightCount", recentHighlights);
        
        // Highlight ID'lerini getir
        debugInfo.put("activeHighlightIds", allHighlights.stream()
                .filter(Highlights::isActive)
                .map(Highlights::getId)
                .collect(Collectors.toList()));
        
        // Günlük highlight ID'lerini getir
        List<Highlights> dailyHighlights = highlightsRepository.findByUserAndUpdatedAtGreaterThanEqualAndIsActiveTrueOrderByUpdatedAtDesc(user, startOfDay);
        debugInfo.put("dailyHighlightIds", dailyHighlights.stream()
                .map(Highlights::getId)
                .collect(Collectors.toList()));
        
        return debugInfo;
    }
}