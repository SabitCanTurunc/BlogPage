package com.tirbuson.service;

import com.tirbuson.dto.request.HighlightRequestDto;
import com.tirbuson.dto.response.HighlightResponseDto;
import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.MessageType;
import com.tirbuson.mapper.HighlightMapper;
import com.tirbuson.model.Highlights;
import com.tirbuson.model.Post;
import com.tirbuson.model.User;
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
    
    private static final int DAILY_HIGHLIGHT_LIMIT = 2;

    public HighlightsService(HighlightsRepository repository, HighlightsRepository highlightsRepository, UserRepository userRepository, PostRepository postRepository, HighlightMapper highlightMapper) {
        super(repository);
        this.highlightsRepository = highlightsRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.highlightMapper = highlightMapper;
    }

    @Transactional
    public HighlightResponseDto createHighlight(Integer userId, HighlightRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(MessageType.USER_NOT_FOUND));
                
        Post post = postRepository.findById(requestDto.getPostId())
                .orElseThrow(() -> new BaseException(MessageType.POST_NOT_FOUND));

        // Günlük limit kontrolü
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.with(LocalTime.MIN);
        long dailyCount = highlightsRepository.countByUserAndUpdatedAtGreaterThanEqualAndIsActiveTrue(user, startOfDay);
        
        if (dailyCount >= DAILY_HIGHLIGHT_LIMIT) {
            throw new BaseException(MessageType.DAILY_HIGHLIGHT_LIMIT_EXCEEDED);
        }

        // Post'un daha önce highlight edilip edilmediğini kontrol et
        Highlights existingHighlight = highlightsRepository.findFirstByUserAndPostOrderByUpdatedAtDesc(user, post)
                .orElse(null);

        if (existingHighlight != null) {
            // Eğer pasif ise aktif hale getir
            if (!existingHighlight.isActive()) {
                existingHighlight.setActive(true);
                existingHighlight.setSeen(false);
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
        
        Highlights savedHighlight = highlightsRepository.save(highlight);
        return highlightMapper.convertToDto(savedHighlight);
    }

    @Transactional(readOnly = true)
    public List<HighlightResponseDto> getUserHighlights(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(MessageType.USER_NOT_FOUND));
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        
        List<Highlights> highlights = highlightsRepository.findByUserAndIsActiveTrueAndUpdatedAtAfterOrderByUpdatedAtDesc(user, sevenDaysAgo);
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
        
        List<Highlights> highlights = highlightsRepository.findByUserAndUpdatedAtGreaterThanEqualAndIsActiveTrueOrderByUpdatedAtDesc(user, startOfDay);
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
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        
        List<Highlights> expiredHighlights = highlightsRepository.findByUpdatedAtLessThanEqualAndIsActiveTrue(sevenDaysAgo);
        
        for (Highlights highlight : expiredHighlights) {
            highlight.setActive(false);
            highlightsRepository.save(highlight);
        }
    }

    @Transactional(readOnly = true)
    public List<HighlightResponseDto> getAllHighlights() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        
        List<Highlights> highlights = highlightsRepository.findByIsActiveTrueAndUpdatedAtAfterOrderByUpdatedAtDesc(sevenDaysAgo);
                
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
        
        return activeHighlights.stream()
                .map(highlightMapper::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public HighlightResponseDto toggleHighlightStatus(Integer highlightId) {
        Highlights highlight = highlightsRepository.findById(highlightId)
                .orElseThrow(() -> new BaseException(MessageType.HIGHLIGHT_NOT_FOUND));
        
        highlight.setActive(!highlight.isActive());
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
        
        // Toplam highlight sayısı
        long totalHighlights = highlightsRepository.count();
        stats.put("totalHighlights", totalHighlights);
        
        // Aktif highlight sayısı
        long activeHighlights = highlightsRepository.countByIsActiveTrue();
        stats.put("activeHighlights", activeHighlights);
        
        // Son 7 gündeki highlight sayısı
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        long recentHighlights = highlightsRepository.countByUpdatedAtAfter(sevenDaysAgo);
        stats.put("recentHighlights", recentHighlights);
        
        // Günlük ortalama highlight sayısı
        double dailyAverage = (double) recentHighlights / 7;
        stats.put("dailyAverage", dailyAverage);
        
        return stats;
    }
}