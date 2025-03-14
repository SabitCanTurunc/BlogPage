package com.tirbuson.controller;

import com.tirbuson.dto.request.PostRequestDto;
import com.tirbuson.dto.response.PostResponseDto;
import com.tirbuson.mapper.PostMapper;
import com.tirbuson.model.Post;
import com.tirbuson.repository.PostRepository;
import com.tirbuson.service.PostService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/post")
public class PostController extends BaseController<PostService, Post,Integer, PostRepository , PostResponseDto, PostRequestDto, PostMapper>{
    private final PostService postService;
    private final PostMapper postMapper;

    protected PostController(PostService service, PostMapper mapper, PostService postService, PostMapper postMapper) {
        super(service, mapper);
        this.postService = postService;
        this.postMapper = postMapper;
    }

    @GetMapping("/user/{userId}")
    public List<PostResponseDto> getPostByUserId(@PathVariable Integer userId) {
        List<PostResponseDto> posts= new ArrayList<>();
        for(Post post : postService.getPostByUserId(userId)) {

            posts.add( postMapper.convertToDto(post));
        }
        return posts;
    }
}
