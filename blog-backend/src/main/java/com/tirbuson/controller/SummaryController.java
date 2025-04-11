package com.tirbuson.controller;

import com.tirbuson.dto.request.SummaryRequestDto;
import com.tirbuson.dto.response.SummaryResponseDto;
import com.tirbuson.mapper.SummaryMapper;
import com.tirbuson.model.Summary;
import com.tirbuson.repository.SummaryRepository;
import com.tirbuson.service.SummaryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
