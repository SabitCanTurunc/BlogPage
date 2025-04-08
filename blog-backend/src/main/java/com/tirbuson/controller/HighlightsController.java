package com.tirbuson.controller;

import com.tirbuson.dto.HighlightRequestDto;
import com.tirbuson.dto.HighlightResponseDto;
import com.tirbuson.mapper.HighlightMapper;
import com.tirbuson.model.Highlights;
import com.tirbuson.repository.HighlightsRepository;
import com.tirbuson.service.HighlightsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/highlights")
public class HighlightsController extends BaseController<HighlightsService, Highlights,Integer, HighlightsRepository,HighlightResponseDto,HighlightRequestDto, HighlightMapper> {

    private final HighlightsService highlightsService;

    public HighlightsController(HighlightsService service, HighlightMapper mapper) {
        super(service, mapper);
        this.highlightsService = service;
    }

    /**
     * Tüm öne çıkan içerikleri getiren public endpoint
     * Bu endpoint herhangi bir yetkilendirme gerektirmez
     */
    @GetMapping("/public")
    public ResponseEntity<List<HighlightResponseDto>> getPublicHighlights() {
        return ResponseEntity.ok(highlightsService.getAllActiveHighlights());
    }

    @PostMapping("/with-user")
    public ResponseEntity<HighlightResponseDto> createWithUser(
            @RequestAttribute("userId") Integer userId,
            @Valid @RequestBody HighlightRequestDto requestDto) {
        return ResponseEntity.ok(highlightsService.createHighlight(userId, requestDto));
    }

    @GetMapping("/user")
    public ResponseEntity<List<HighlightResponseDto>> getUserHighlights(
            @RequestAttribute("userId") Integer userId) {
        return ResponseEntity.ok(highlightsService.getUserHighlights(userId));
    }

    @GetMapping("/user/daily")
    public ResponseEntity<List<HighlightResponseDto>> getDailyHighlights(
            @RequestAttribute("userId") Integer userId) {
        return ResponseEntity.ok(highlightsService.getDailyHighlights(userId));
    }

    @DeleteMapping("/custom-delete/{highlightId}")
    public ResponseEntity<Void> deleteHighlight(
            @RequestAttribute("userId") Integer userId,
            @PathVariable Integer highlightId) {
        highlightsService.deleteHighlight(userId, highlightId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{highlightId}/seen")
    public ResponseEntity<HighlightResponseDto> markAsSeen(@PathVariable Integer highlightId) {
        return ResponseEntity.ok(highlightsService.markAsSeen(highlightId));
    }
}