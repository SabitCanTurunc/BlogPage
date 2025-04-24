package com.tirbuson.repository;

import com.tirbuson.model.SubscriptionRequest;
import com.tirbuson.model.User;
import com.tirbuson.model.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionRequestRepository extends JpaRepository<SubscriptionRequest, Integer> {
    
    List<SubscriptionRequest> findByUserOrderByRequestDateDesc(User user);
    
    List<SubscriptionRequest> findByStatusOrderByRequestDateAsc(RequestStatus status);
    
    List<SubscriptionRequest> findAllByOrderByRequestDateDesc();
} 