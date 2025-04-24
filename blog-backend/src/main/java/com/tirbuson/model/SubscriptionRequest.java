package com.tirbuson.model;

import com.tirbuson.model.enums.RequestStatus;
import com.tirbuson.model.enums.SubscriptionPlan;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionPlan currentPlan;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionPlan requestedPlan;

    @Column(nullable = false)
    private LocalDateTime requestDate;

    @Column
    private LocalDateTime processDate;

    @Column
    private String adminNote;

    @Column
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;
} 