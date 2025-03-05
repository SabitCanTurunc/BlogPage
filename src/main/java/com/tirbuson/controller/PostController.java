package com.tirbuson.controller;

import com.tirbuson.dto.request.PostRequestDto;
import com.tirbuson.dto.response.PostResponseDto;
import com.tirbuson.mapper.PostMapper;
import com.tirbuson.model.Post;
import com.tirbuson.repository.PostRepository;
import com.tirbuson.service.PostService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/post")
public class PostController extends BaseController<PostService, Post,Integer, PostRepository , PostResponseDto, PostRequestDto, PostMapper>{
    protected PostController(PostService service, PostMapper mapper) {
        super(service, mapper);
    }
}
