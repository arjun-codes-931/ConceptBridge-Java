package com.conceptbridge.dto;

import com.conceptbridge.entity.Assessment;
import com.conceptbridge.entity.AssessmentType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class AssessmentDTO {
    private Long id;
    private String title;
    private AssessmentType type;
    private Long teacherId;
    private Long topicId;
    private List<QuestionDTO> questions;
    private LocalDateTime createdAt;
    private LocalDateTime dueDate;
    private Integer timeLimit;
    private Integer maxAttempts;
    private Boolean isActive;
    private Double passingScore;

    // Constructor from Entity
    public AssessmentDTO(Assessment assessment) {
        this.id = assessment.getId();
        this.title = assessment.getTitle();
        this.type = assessment.getType();
        this.teacherId = assessment.getTeacher() != null ? assessment.getTeacher().getId() : null;
        this.topicId = assessment.getTopic() != null ? assessment.getTopic().getId() : null;
        this.createdAt = assessment.getCreatedAt();
        this.dueDate = assessment.getDueDate();
        this.timeLimit = assessment.getTimeLimit();
        this.maxAttempts = assessment.getMaxAttempts();
        this.isActive = assessment.getIsActive();
        this.passingScore = assessment.getPassingScore();

        // Convert questions to DTOs if needed
        if (assessment.getQuestions() != null) {
            this.questions = assessment.getQuestions().stream()
                    .map(QuestionDTO::new)
                    .collect(Collectors.toList());
        }
    }

    // Default constructor
    public AssessmentDTO() {}

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
    public List<QuestionDTO> getQuestions() { return questions; }
    public void setQuestions(List<QuestionDTO> questions) { this.questions = questions; }
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
}