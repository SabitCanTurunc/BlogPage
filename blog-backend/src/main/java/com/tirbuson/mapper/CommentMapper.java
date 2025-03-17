package com.tirbuson.mapper;

import com.tirbuson.dto.request.CommentRequestDto;
import com.tirbuson.dto.response.CommentResponseDto;
import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.ErrorMessage;
import com.tirbuson.exception.MessageType;
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
            if (post.isEmpty()) {
                throw new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Post bulunamadı: " + dto.getPostId()));
            }
            comment.setPost(post.get());
        } else {
            throw new BaseException(new ErrorMessage(MessageType.GENERAL_EXCEPTION, "Post ID boş olamaz"));
        }

        // User'ı email'e göre repository'den al
        if (dto.getUserId() != null) {
            Optional<User> user = userRepository.findById(dto.getUserId());
            if (user.isEmpty()) {
                throw new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Kullanıcı bulunamadı: " + dto.getUserId()));
            }
            comment.setUser(user.get());
        } else if (dto.getUserEmail() != null) {
            Optional<User> user = userRepository.findByEmail(dto.getUserEmail());
            if (user.isEmpty()) {
                throw new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Kullanıcı bulunamadı: " + dto.getUserEmail()));
            }
            comment.setUser(user.get());
        } else {
            throw new BaseException(new ErrorMessage(MessageType.GENERAL_EXCEPTION, "Kullanıcı bilgisi boş olamaz"));
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