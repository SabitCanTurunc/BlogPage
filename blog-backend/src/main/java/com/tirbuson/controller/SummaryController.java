package com.tirbuson.controller;

import com.tirbuson.dto.request.SummaryRequestDto;
import com.tirbuson.dto.response.SummaryResponseDto;
import com.tirbuson.mapper.SummaryMapper;
import com.tirbuson.model.Summary;
import com.tirbuson.repository.SummaryRepository;
import com.tirbuson.service.SummaryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

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
    public SummaryResponseDto getByPostId(@PathVariable Integer postId) {
        try {
            Summary summary = summaryService.findByPostId(postId);
            return summaryMapper.convertToDto(summary);
        } catch (IOException e) {
            // IOException hatası burada yakalanır
            throw new RuntimeException("Error while generating summary: " + e.getMessage(), e);
        } catch (InterruptedException e) {
            // InterruptedException hatası burada yakalanır
            throw new RuntimeException("Request interrupted: " + e.getMessage(), e);
        }
    }
}
