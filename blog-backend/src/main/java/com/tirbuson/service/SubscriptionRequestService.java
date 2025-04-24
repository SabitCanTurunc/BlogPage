package com.tirbuson.service;

import com.tirbuson.dto.request.SubscriptionRequestDto;
import com.tirbuson.dto.response.SubscriptionRequestResponseDto;
import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.ErrorMessage;
import com.tirbuson.exception.MessageType;
import com.tirbuson.mapper.SubscriptionRequestMapper;
import com.tirbuson.model.SubscriptionRequest;
import com.tirbuson.model.User;
import com.tirbuson.model.enums.RequestStatus;
import com.tirbuson.repository.SubscriptionRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SubscriptionRequestService {

    private final SubscriptionRequestRepository subscriptionRequestRepository;
    private final SubscriptionRequestMapper subscriptionRequestMapper;
    private final UserService userService;

    public SubscriptionRequestService(SubscriptionRequestRepository subscriptionRequestRepository,
                                     SubscriptionRequestMapper subscriptionRequestMapper,
                                     UserService userService) {
        this.subscriptionRequestRepository = subscriptionRequestRepository;
        this.subscriptionRequestMapper = subscriptionRequestMapper;
        this.userService = userService;
    }

    @Transactional
    public SubscriptionRequestResponseDto createRequest(String userEmail, SubscriptionRequestDto subscriptionRequestDto) {
        User user = userService.findByEmail(userEmail);

        // Kullanıcının mevcut planı ile talep ettiği plan aynı mı kontrol et
        if (user.getSubscriptionPlan() == subscriptionRequestDto.getRequestedPlan()) {
            throw new BaseException(new ErrorMessage(MessageType.INVALID_REQUEST, "Zaten bu abonelik planına sahipsiniz"));
        }
        
        // Kullanıcının bekleyen bir isteği var mı kontrol et
        List<SubscriptionRequest> pendingRequests = subscriptionRequestRepository.findByUserOrderByRequestDateDesc(user)
                .stream()
                .filter(request -> request.getStatus() == RequestStatus.PENDING)
                .collect(Collectors.toList());
                
        if (!pendingRequests.isEmpty()) {
            throw new BaseException(new ErrorMessage(MessageType.PENDING_REQUEST_EXISTS, "Zaten bekleyen bir abonelik talebiniz bulunmaktadır"));
        }
        
        // Yeni istek oluştur
        SubscriptionRequest subscriptionRequest = subscriptionRequestMapper.convertToEntity(subscriptionRequestDto, user);
        subscriptionRequest = subscriptionRequestRepository.save(subscriptionRequest);
        
        return subscriptionRequestMapper.convertToDto(subscriptionRequest);
    }
    
    @Transactional(readOnly = true)
    public List<SubscriptionRequestResponseDto> getUserRequests(String userEmail) {
        User user = userService.findByEmail(userEmail);
        return subscriptionRequestRepository.findByUserOrderByRequestDateDesc(user)
                .stream()
                .map(subscriptionRequestMapper::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<SubscriptionRequestResponseDto> getAllPendingRequests() {
        return subscriptionRequestRepository.findByStatusOrderByRequestDateAsc(RequestStatus.PENDING)
                .stream()
                .map(subscriptionRequestMapper::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<SubscriptionRequestResponseDto> getAllRequests() {
        return subscriptionRequestRepository.findAllByOrderByRequestDateDesc()
                .stream()
                .map(subscriptionRequestMapper::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public SubscriptionRequestResponseDto processRequest(Integer requestId, boolean approved, String adminNote) {
        SubscriptionRequest request = subscriptionRequestRepository.findById(requestId)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, requestId.toString())));
        
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BaseException(new ErrorMessage(MessageType.INVALID_REQUEST, "Bu talep zaten işlenmiş"));
        }
        
        // İsteği güncelle
        request.setStatus(approved ? RequestStatus.APPROVED : RequestStatus.REJECTED);
        request.setAdminNote(adminNote);
        request.setProcessDate(LocalDateTime.now());
        
        // Onaylandıysa kullanıcının abonelik planını güncelle
        if (approved) {
            User user = request.getUser();
            user.setSubscriptionPlan(request.getRequestedPlan());
            userService.update(user);
        }
        
        request = subscriptionRequestRepository.save(request);
        return subscriptionRequestMapper.convertToDto(request);
    }
    
    @Transactional
    public Map<String, Object> cancelRequest(Integer requestId, String userEmail) {
        User user = userService.findByEmail(userEmail);
        SubscriptionRequest request = subscriptionRequestRepository.findById(requestId)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, requestId.toString())));
        
        // Kullanıcı kendi talebini iptal ediyor mu kontrol et
        if (!request.getUser().getId().equals(user.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.UNAUTHORIZED_ACCESS, "Bu talebi iptal etme yetkiniz yok"));
        }
        
        // Talep durumu kontrol et
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BaseException(new ErrorMessage(MessageType.INVALID_REQUEST, "Bu talep zaten işlenmiş, iptal edilemez"));
        }
        
        // Talebi sil
        subscriptionRequestRepository.delete(request);
        
        return Map.of(
            "message", "Abonelik yükseltme talebi başarıyla iptal edildi",
            "success", true
        );
    }
    
    @Transactional
    public Map<String, Object> deleteRejectedRequest(Integer requestId, String userEmail) {
        User user = userService.findByEmail(userEmail);
        SubscriptionRequest request = subscriptionRequestRepository.findById(requestId)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, requestId.toString())));
        
        // Kullanıcı kendi talebini siliyor mu kontrol et
        if (!request.getUser().getId().equals(user.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.UNAUTHORIZED_ACCESS, "Bu isteği silme yetkiniz yok"));
        }
        
        // Talep durumu kontrol et - sadece reddedilmiş talepler silinebilir
        if (request.getStatus() != RequestStatus.REJECTED) {
            throw new BaseException(new ErrorMessage(MessageType.INVALID_REQUEST, "Sadece reddedilmiş talepler silinebilir"));
        }
        
        // Talebi sil
        subscriptionRequestRepository.delete(request);
        
        return Map.of(
            "message", "Reddedilen abonelik talebi başarıyla silindi",
            "success", true
        );
    }
} 