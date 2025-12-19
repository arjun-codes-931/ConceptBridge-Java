package com.conceptbridge.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate; // Changed from LocalDateTime to LocalDate for dates
import java.time.LocalDateTime;

public class ProjectRequest {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String technologiesUsed;
    private LocalDate startDate;  // Keep as LocalDateTime
    private LocalDate endDate;    // Keep as LocalDateTime
    private String projectStatus;
    private Double progressPercentage;
    private String githubUrl;
    private String documentationUrl;
    private Long studentId;

    // Constructors
    public ProjectRequest() {}

    public ProjectRequest(String title, Long studentId) {
        this.title = title;
        this.studentId = studentId;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getTechnologiesUsed() { return technologiesUsed; }
    public void setTechnologiesUsed(String technologiesUsed) { this.technologiesUsed = technologiesUsed; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getProjectStatus() { return projectStatus; }
    public void setProjectStatus(String projectStatus) { this.projectStatus = projectStatus; }

    public Double getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Double progressPercentage) { this.progressPercentage = progressPercentage; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getDocumentationUrl() { return documentationUrl; }
    public void setDocumentationUrl(String documentationUrl) { this.documentationUrl = documentationUrl; }
}