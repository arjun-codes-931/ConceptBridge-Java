package com.conceptbridge.dto.response;

import com.conceptbridge.entity.AssessmentType;
import java.time.LocalDateTime;

public class AssessmentResponse {
    private Long id;
    private String title;
    private AssessmentType type;
    private Long teacherId;
    private Long topicId;
    private LocalDateTime createdAt;
    private LocalDateTime dueDate;
    private Integer timeLimit;
    private Integer maxAttempts;
    private Boolean isActive;
    private Double passingScore;
    private Integer questionCount;
    private Integer responseCount;

    // Constructors
    public AssessmentResponse() {}

    public AssessmentResponse(Long id, String title, AssessmentType type, Long teacherId, Long topicId) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.teacherId = teacherId;
        this.topicId = topicId;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public AssessmentType getType() { return type; }
    public void setType(AssessmentType type) { this.type = type; }

    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }

    public Long getTopicId() { return topicId; }
    public void setTopicId(Long topicId) { this.topicId = topicId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public Integer getTimeLimit() { return timeLimit; }
    public void setTimeLimit(Integer timeLimit) { this.timeLimit = timeLimit; }

    public Integer getMaxAttempts() { return maxAttempts; }
    public void setMaxAttempts(Integer maxAttempts) { this.maxAttempts = maxAttempts; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Double getPassingScore() { return passingScore; }
    public void setPassingScore(Double passingScore) { this.passingScore = passingScore; }

    public Integer getQuestionCount() { return questionCount; }
    public void setQuestionCount(Integer questionCount) { this.questionCount = questionCount; }

    public Integer getResponseCount() { return responseCount; }
    public void setResponseCount(Integer responseCount) { this.responseCount = responseCount; }
}