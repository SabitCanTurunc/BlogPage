package com.tirbuson.controller;

import com.tirbuson.dto.request.PostRequestDto;
import com.tirbuson.dto.response.PostResponseDto;
import com.tirbuson.mapper.PostMapper;
import com.tirbuson.model.Post;
import com.tirbuson.repository.PostRepository;
import com.tirbuson.service.PostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/post")
public class PostController extends BaseController<PostService, Post,Integer, PostRepository , PostResponseDto, PostRequestDto, PostMapper>{
    private final PostService postService;
    private final PostMapper postMapper;

    protected PostController(PostService service, PostMapper mapper) {
        super(service, mapper);
        this.postService = service;
        this.postMapper = mapper;
    }

    @GetMapping("/user/{userId}")
    public List<PostResponseDto> getPostByUserId(@PathVariable Integer userId) {
        List<PostResponseDto> posts= new ArrayList<>();
        for(Post post : postService.getPostByUserId(userId)) {

            posts.add( postMapper.convertToDto(post));
        }
        return posts;
    }
    
    // Sayfalama ile postları getiren endpoint
    @GetMapping("/paged")
    public ResponseEntity<Map<String, Object>> getPagedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String category) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<Post> pagePost;
            
            if (category == null || category.isEmpty()) {
                pagePost = postService.getAllPosts(pageable);
            } else {
                pagePost = postService.getPostsByCategory(category, pageable);
            }
            
            List<Post> posts = pagePost.getContent();
            List<PostResponseDto> postDtos = posts.stream()
                    .map(postMapper::convertToDto)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("posts", postDtos);
            response.put("currentPage", pagePost.getNumber());
            response.put("totalItems", pagePost.getTotalElements());
            response.put("totalPages", pagePost.getTotalPages());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Postlar getirilirken bir hata oluştu: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    // Tüm kategorileri getiren endpoint
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        try {
            List<String> categories = postService.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }
    
    // Popüler yazarları getiren endpoint (en çok yazı yazan 5 yazar)
    @GetMapping("/popular-authors")
    public ResponseEntity<List<String>> getPopularAuthors() {
        try {
            List<String> authors = postService.getPopularAuthors();
            return ResponseEntity.ok(authors);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }
    
    // Son eklenen 5 yazıyı getiren endpoint
    @GetMapping("/recent")
    public ResponseEntity<List<PostResponseDto>> getRecentPosts() {
        try {
            List<Post> recentPosts = postService.getRecentPosts();
            List<PostResponseDto> recentPostDtos = recentPosts.stream()
                    .map(postMapper::convertToDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(recentPostDtos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }
    
    // Arama yapan endpoint
    @GetMapping("/search")
    public ResponseEntity<List<PostResponseDto>> searchPosts(@RequestParam String query) {
        try {
            List<Post> searchResults = postService.searchPosts(query);
            List<PostResponseDto> searchResultDtos = searchResults.stream()
                    .map(postMapper::convertToDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(searchResultDtos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }
}
