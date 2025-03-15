package com.tirbuson.controller;

import com.tirbuson.dto.request.CommentRequestDto;
import com.tirbuson.dto.response.CommentResponseDto;
import com.tirbuson.mapper.CommentMapper;
import com.tirbuson.model.Comment;
import com.tirbuson.repository.CommentRepository;
import com.tirbuson.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/comment")
public class CommentController extends BaseController<CommentService, Comment, Integer, CommentRepository, CommentResponseDto, CommentRequestDto, CommentMapper> {

    private final CommentService commentService;
    private final CommentMapper commentMapper;

    protected CommentController(CommentService service, CommentMapper mapper) {
        super(service, mapper);
        this.commentService = service;
        this.commentMapper = mapper;
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentResponseDto>> getCommentsByPostId(@PathVariable Integer postId) {
        List<CommentResponseDto> comments = new ArrayList<>();
        for (Comment comment : commentService.getCommentsByPostId(postId)) {
            comments.add(commentMapper.convertToDto(comment));
        }
        return ResponseEntity.ok(comments);
    }
} 