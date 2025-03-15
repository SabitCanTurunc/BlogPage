package com.tirbuson.service;

import com.tirbuson.model.Comment;
import com.tirbuson.repository.CommentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService extends BaseService<Comment, Integer, CommentRepository> {
    private final CommentRepository repository;
    private final OwnershipService ownershipService;

    public CommentService(CommentRepository repository, OwnershipService ownershipService) {
        super(repository);
        this.repository = repository;
        this.ownershipService = ownershipService;
    }

    public List<Comment> getCommentsByPostId(Integer postId) {
        return repository.findByPostId(postId);
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        ownershipService.verifyOwnership(id, repository);
        super.deleteById(id);
    }

    @Override
    @Transactional
    public Comment update(Comment entity) {
        ownershipService.verifyOwnership((Integer) entity.getId(), repository);
        return super.update(entity);
    }
} 