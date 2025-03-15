package com.tirbuson.mapper;

import com.tirbuson.dto.request.CommentRequestDto;
import com.tirbuson.dto.response.CommentResponseDto;
import com.tirbuson.model.Comment;
import com.tirbuson.model.Post;
import com.tirbuson.model.User;
import com.tirbuson.repository.PostRepository;
import com.tirbuson.repository.UserRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class CommentMapper implements BaseMapper<Comment, CommentResponseDto, CommentRequestDto> {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public CommentMapper(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Comment convertToEntity(CommentRequestDto dto) {
        if (dto == null) {
            return null;
        }

        Comment comment = new Comment();
        comment.setComment(dto.getComment());

        // Post'u repository'den al
        if (dto.getPostId() != null) {
            Optional<Post> post = postRepository.findById(dto.getPostId());
            post.ifPresent(comment::setPost);
        }

        // User'ı email'e göre repository'den al
        if (dto.getUserEmail() != null) {
            Optional<User> user = userRepository.findByEmail(dto.getUserEmail());
            user.ifPresent(comment::setUser);
        }

        return comment;
    }

    @Override
    public CommentResponseDto convertToDto(Comment entity) {
        if (entity == null) {
            return null;
        }

        CommentResponseDto dto = new CommentResponseDto();
        dto.setId(entity.getId());
        dto.setComment(entity.getComment());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getPost() != null) {
            dto.setPostId(entity.getPost().getId());
        }

        if (entity.getUser() != null) {
            dto.setUserEmail(entity.getUser().getEmail());
            dto.setUsername(entity.getUser().getUsername());
        }

        return dto;
    }
} 