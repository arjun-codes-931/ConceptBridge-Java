package com.conceptbridge.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TopicRequest {
    @NotBlank
    private String title;

    private String description;
    private String category;

    @NotNull
    private Integer complexityLevel;

    @NotNull
    private Long teacherId;

    // Constructors
    public TopicRequest() {}

    public TopicRequest(String title, Integer complexityLevel, Long teacherId) {
        this.title = title;
        this.complexityLevel = complexityLevel;
        this.teacherId = teacherId;
    }

    // Getters and Setters
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
}