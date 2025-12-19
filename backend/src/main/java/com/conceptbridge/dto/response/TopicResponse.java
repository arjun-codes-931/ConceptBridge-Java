package com.conceptbridge.dto.response;

import java.time.LocalDateTime;

public class TopicResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private Integer complexityLevel;
    private Long teacherId;
    private String teacherName;
    private LocalDateTime createdAt;
    private Integer explanationCount;
    private Integer assessmentCount;
    private Boolean isActive;

    // Constructors
    public TopicResponse() {}

    public TopicResponse(Long id, String title, String description, Long teacherId, String teacherName) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.teacherId = teacherId;
        this.teacherName = teacherName;
    }

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

    public Integer getExplanationCount() { return explanationCount; }
    public void setExplanationCount(Integer explanationCount) { this.explanationCount = explanationCount; }

    public Integer getAssessmentCount() { return assessmentCount; }
    public void setAssessmentCount(Integer assessmentCount) { this.assessmentCount = assessmentCount; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}