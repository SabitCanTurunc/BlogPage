package com.tirbuson.service;

import com.tirbuson.dto.HighlightRequestDto;
import com.tirbuson.dto.HighlightResponseDto;
import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.MessageType;
import com.tirbuson.mapper.HighlightMapper;
import com.tirbuson.model.Highlights;
import com.tirbuson.model.Post;
import com.tirbuson.model.User;
import com.tirbuson.repository.HighlightsRepository;
import com.tirbuson.repository.PostRepository;
import com.tirbuson.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
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
        long dailyCount = highlightsRepository.countDailyHighlights(user, startOfDay, now);
        
        if (dailyCount >= DAILY_HIGHLIGHT_LIMIT) {
            throw new BaseException(MessageType.DAILY_HIGHLIGHT_LIMIT_EXCEEDED);
        }

        // Post'un daha önce highlight edilip edilmediğini kontrol et
        Highlights existingHighlight = highlightsRepository.findByUserAndPost(user, post)
                .orElse(null);

        if (existingHighlight != null) {
            // Eğer pasif ise aktif hale getir
            if (!existingHighlight.isActive()) {
                existingHighlight.setActive(true);
                existingHighlight.setSeen(false);
                existingHighlight.setHighlightDate(now);
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
        highlight.setHighlightDate(now);
        
        Highlights savedHighlight = highlightsRepository.save(highlight);
        return highlightMapper.convertToDto(savedHighlight);
    }

    @Transactional(readOnly = true)
    public List<HighlightResponseDto> getUserHighlights(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(MessageType.USER_NOT_FOUND));
        
        LocalDateTime now = LocalDateTime.now();        
        List<Highlights> highlights = highlightsRepository.findByUserOrderByHighlightDateDesc(user, now);
        return highlights.stream()
                .filter(Highlights::isActive)
                .map(highlightMapper::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HighlightResponseDto> getDailyHighlights(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(MessageType.USER_NOT_FOUND));
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.with(LocalTime.MIN);
        List<Highlights> highlights = highlightsRepository.findDailyHighlights(user, startOfDay, now);
        return highlights.stream()
                .filter(Highlights::isActive)
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
        
        LocalDateTime now = LocalDateTime.now();
        
        if (!highlight.isActive() || highlight.getExpiresAt().isBefore(now)) {
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
        List<Highlights> expiredHighlights = highlightsRepository.findExpiredHighlights(now);
        
        for (Highlights highlight : expiredHighlights) {
            highlight.setActive(false);
            highlightsRepository.save(highlight);
        }
    }

    @Transactional(readOnly = true)
    public List<HighlightResponseDto> getAllHighlights() {
        LocalDateTime now = LocalDateTime.now();
        List<Highlights> highlights = highlightsRepository.findAll().stream()
                .filter(h -> h.isActive() && h.getExpiresAt().isAfter(now))
                .collect(Collectors.toList());
                
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
        // Son 7 günde oluşturulan ve aktif olan highlight'ları getir
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        
        // Özel sorgu ile aktif highlight'ları getir
        List<Highlights> activeHighlights = highlightsRepository.findAllActiveHighlights(now, sevenDaysAgo);
        
        return activeHighlights.stream()
                .map(highlightMapper::convertToDto)
                .collect(Collectors.toList());
    }
}