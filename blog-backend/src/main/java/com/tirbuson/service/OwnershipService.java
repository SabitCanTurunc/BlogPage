package com.tirbuson.service;

import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.ErrorMessage;
import com.tirbuson.exception.MessageType;
import com.tirbuson.model.Ownable;
import com.tirbuson.repository.BaseRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service("ownershipService")
public class OwnershipService {

    public <E extends Ownable, ID> boolean isOwnerOrAdmin(ID entityId, BaseRepository<? extends E, ID> repository) {
        E entity = repository.findById(entityId)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, entityId.toString())));

        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String currentUserEmail = userDetails.getUsername();
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

        return entity.getOwner().getEmail().equals(currentUserEmail) || isAdmin;
    }

    public <E extends Ownable, ID> E verifyOwnership(ID entityId, BaseRepository<? extends E, ID> repository) {
        E entity = repository.findById(entityId)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, entityId.toString())));

        if (!isOwnerOrAdmin(entityId, repository)) {
            throw new BaseException(MessageType.UNAUTHORIZED_ACCESS, "Kayıt ID: " + entityId);
        }


        return entity;
    }
}