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


}
