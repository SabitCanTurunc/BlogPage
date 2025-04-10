package com.tirbuson.mapper;


import com.tirbuson.dto.request.SummaryRequestDto;
import com.tirbuson.dto.response.PostResponseDto;
import com.tirbuson.dto.response.SummaryResponseDto;
import com.tirbuson.model.Summary;
import com.tirbuson.service.PostService;
import org.springframework.stereotype.Component;

@Component
public class SummaryMapper implements BaseMapper<Summary, SummaryResponseDto, SummaryRequestDto> {

    private final PostService postService;
    private final PostMapper postMapper;

    public SummaryMapper(PostService postService, PostMapper postMapper) {
        this.postService = postService;
        this.postMapper = postMapper;
    }

    @Override
    public Summary convertToEntity(SummaryRequestDto summaryRequestDto) {
        Summary summary = new Summary();
        summary.setPost(postService.findById(summaryRequestDto.getPostId()));
        summary.setSummary(summaryRequestDto.getSummary());

        return summary;
    }

    @Override
    public SummaryResponseDto convertToDto(Summary entity) {
        SummaryResponseDto summaryResponseDto = new SummaryResponseDto();
        summaryResponseDto.setId(entity.getId());
        summaryResponseDto.setSummary(entity.getSummary());
        
        if (entity.getPost() != null) {
            PostResponseDto postResponseDto = new PostResponseDto();
            postResponseDto=postMapper.convertToDto(entity.getPost());

            // başka gerekli alan varsa eklerim.
            summaryResponseDto.setPost(postResponseDto);
        }

        return summaryResponseDto;
    }
}
