package com.conceptbridge.dto.teacherDTO;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class PDFUploadRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    private Boolean isPublic = true; // Add this back
    private List<Long> accessibleStudentIds; // Add this back if needed

    // Constructors
    public PDFUploadRequest() {
    }

    public PDFUploadRequest(String title, String description, String category, Boolean isPublic, List<Long> accessibleStudentIds) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.isPublic = isPublic;
        this.accessibleStudentIds = accessibleStudentIds;
    }

    // Getters and setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public List<Long> getAccessibleStudentIds() {
        return accessibleStudentIds;
    }

    public void setAccessibleStudentIds(List<Long> accessibleStudentIds) {
        this.accessibleStudentIds = accessibleStudentIds;
    }
}