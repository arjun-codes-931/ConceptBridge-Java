package com.conceptbridge.dto.request;

import com.conceptbridge.entity.AssessmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class AssessmentRequest {
    @NotBlank
    private String title;

    @NotNull
    private AssessmentType type;

    @NotNull
    private Long teacherId;

    @NotNull
    private Long topicId;

    private LocalDateTime dueDate;
    private Integer timeLimit;
    private Integer maxAttempts;
    private Double passingScore;

    // Constructors
    public AssessmentRequest() {}

    public AssessmentRequest(String title, AssessmentType type, Long teacherId, Long topicId) {
        this.title = title;
        this.type = type;
        this.teacherId = teacherId;
        this.topicId = topicId;
    }

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public AssessmentType getType() { return type; }
    public void setType(AssessmentType type) { this.type = type; }

    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }

    public Long getTopicId() { return topicId; }
    public void setTopicId(Long topicId) { this.topicId = topicId; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public Integer getTimeLimit() { return timeLimit; }
    public void setTimeLimit(Integer timeLimit) { this.timeLimit = timeLimit; }

    public Integer getMaxAttempts() { return maxAttempts; }
    public void setMaxAttempts(Integer maxAttempts) { this.maxAttempts = maxAttempts; }

    public Double getPassingScore() { return passingScore; }
    public void setPassingScore(Double passingScore) { this.passingScore = passingScore; }
}