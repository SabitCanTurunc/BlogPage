package com.tirbuson.controller;

import com.tirbuson.dto.request.SummaryRequestDto;
import com.tirbuson.dto.response.SummaryResponseDto;
import com.tirbuson.exception.BaseException;
import com.tirbuson.mapper.SummaryMapper;
import com.tirbuson.model.Summary;
import com.tirbuson.repository.SummaryRepository;
import com.tirbuson.service.SummaryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.util.Map;

@RestController
@RequestMapping("/summary")
public class SummaryController extends BaseController<SummaryService,Summary,Integer, SummaryRepository, SummaryResponseDto, SummaryRequestDto, SummaryMapper> {
    private final SummaryService summaryService;
    private final SummaryMapper summaryMapper;

    public SummaryController(SummaryService summaryService, SummaryMapper summaryMapper) {
        super(summaryService, summaryMapper);
        this.summaryService = summaryService;
        this.summaryMapper = summaryMapper;
    }

    @GetMapping("/getByPostId/{postId}")
    @PreAuthorize("isAuthenticated()")
    public SummaryResponseDto getByPostId(@PathVariable Integer postId) {
        Summary summary = summaryService.findByPostId(postId);
        return summaryMapper.convertToDto(summary);
    }

    @PostMapping("/regenerate/{postId}")
    @PreAuthorize("isAuthenticated()")
    public SummaryResponseDto regenerateSummary(@PathVariable Integer postId) {
        Summary summary = summaryService.regenerateSummary(postId);
        return summaryMapper.convertToDto(summary);
    }

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<StreamingResponseBody> chatWithAI(@RequestBody Map<String, String> request) {
        String question = request.get("question");
        if (question == null || question.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            StreamingResponseBody stream = summaryService.streamChatWithAi(question);
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_EVENT_STREAM)
                    .header("Cache-Control", "no-cache")
                    .header("Connection", "keep-alive")
                    .header("X-Accel-Buffering", "no")
                    .body(stream);
        } catch (BaseException e) {
            if (e.getMessage().contains("EXTERNAL_SERVICE_ERROR")) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
