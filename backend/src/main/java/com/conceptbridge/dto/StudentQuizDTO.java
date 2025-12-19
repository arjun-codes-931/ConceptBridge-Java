package com.conceptbridge.dto;

import com.conceptbridge.entity.Assessment;

public class StudentQuizDTO {
    private Long id;
    private String title;
    private String status;

    public StudentQuizDTO() {
    }

    public StudentQuizDTO(Assessment a, String status) {
        this.id = a.getId();
        this.title = a.getTitle();
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
