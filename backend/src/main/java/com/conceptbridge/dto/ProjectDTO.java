package com.conceptbridge.dto;

import com.conceptbridge.entity.Project;
import java.time.LocalDate;

public class ProjectDTO {
    private Long id;
    private String title;
    private String description;
    private String technologiesUsed;
    private LocalDate startDate;  // Changed to LocalDate
    private LocalDate endDate;    // Changed to LocalDate
    private String projectStatus;
    private Double progressPercentage;
    private String githubUrl;
    private String documentationUrl;
    private Long studentId;       // Added studentId
    private String studentName;   // Added student name for display

    // Default constructor
    public ProjectDTO() {}

    // Constructor from Entity
    public ProjectDTO(Project project) {
        this.id = project.getId();
        this.title = project.getTitle();
        this.description = project.getDescription();
        this.technologiesUsed = project.getTechnologiesUsed();
        this.startDate = project.getStartDate();
        this.endDate = project.getEndDate();
        this.projectStatus = project.getProjectStatus();
        this.progressPercentage = project.getProgressPercentage();
        this.githubUrl = project.getGithubUrl();
        this.documentationUrl = project.getDocumentationUrl();

        // Set student information
        if (project.getStudent() != null) {
            this.studentId = project.getStudent().getId();
            this.studentName = project.getStudent().getFirstName() + " " + project.getStudent().getLastName();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

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

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
}