package com.conceptbridge.dto;

import com.conceptbridge.entity.Topic;
import java.time.LocalDateTime;

public class TopicDTO {
    private Long id;
    private String title;
    private String description;
    private String category;
    private Integer complexityLevel;
    private Long teacherId;
    private String teacherName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isActive;
    private Integer explanationCount;
    private Integer assessmentCount;

    // Constructor from Entity
    public TopicDTO(Topic topic) {
        this.id = topic.getId();
        this.title = topic.getTitle();
        this.description = topic.getDescription();
        this.category = topic.getCategory();
        this.complexityLevel = topic.getComplexityLevel();
        this.teacherId = topic.getTeacher() != null ? topic.getTeacher().getId() : null;
        this.teacherName = topic.getTeacher() != null ?
                topic.getTeacher().getFirstName() + " " + topic.getTeacher().getLastName() : null;
        this.createdAt = topic.getCreatedAt();
        this.updatedAt = topic.getUpdatedAt();
        this.isActive = topic.getIsActive();
        this.explanationCount = topic.getExplanations() != null ? topic.getExplanations().size() : 0;
        this.assessmentCount = topic.getAssessments() != null ? topic.getAssessments().size() : 0;
    }

    // Default constructor
    public TopicDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Integer getComplexityLevel() { return complexityLevel; }
    public void setComplexityLevel(Integer complexityLevel) { this.complexityLevel = complexityLevel; }
    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }
    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Integer getExplanationCount() { return explanationCount; }
    public void setExplanationCount(Integer explanationCount) { this.explanationCount = explanationCount; }
    public Integer getAssessmentCount() { return assessmentCount; }
    public void setAssessmentCount(Integer assessmentCount) { this.assessmentCount = assessmentCount; }
}