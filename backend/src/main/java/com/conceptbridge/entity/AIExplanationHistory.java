package com.conceptbridge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_explanation_history")
@Builder
public class AIExplanationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pdf_id")
    private PDFDocument pdfDocument;

    @Column(length = 5000)
    private String originalContent;

    @Column(length = 10000)
    private String explanation;

    @Column(nullable = false)
    private String language = "English";

    @Column(nullable = false)
    private String complexity = "simple";

    @Column(nullable = false)
    private Integer tokenCount = 0;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime viewedAt;

    @Column(nullable = false)
    private Boolean isSaved = false;

    public AIExplanationHistory() {
    }

    public AIExplanationHistory(Long id, User student, PDFDocument pdfDocument, String originalContent, String explanation, String language, String complexity, Integer tokenCount, LocalDateTime createdAt, LocalDateTime viewedAt, Boolean isSaved) {
        this.id = id;
        this.student = student;
        this.pdfDocument = pdfDocument;
        this.originalContent = originalContent;
        this.explanation = explanation;
        this.language = language;
        this.complexity = complexity;
        this.tokenCount = tokenCount;
        this.createdAt = createdAt;
        this.viewedAt = viewedAt;
        this.isSaved = isSaved;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public PDFDocument getPdfDocument() {
        return pdfDocument;
    }

    public void setPdfDocument(PDFDocument pdfDocument) {
        this.pdfDocument = pdfDocument;
    }

    public String getOriginalContent() {
        return originalContent;
    }

    public void setOriginalContent(String originalContent) {
        this.originalContent = originalContent;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getComplexity() {
        return complexity;
    }

    public void setComplexity(String complexity) {
        this.complexity = complexity;
    }

    public Integer getTokenCount() {
        return tokenCount;
    }

    public void setTokenCount(Integer tokenCount) {
        this.tokenCount = tokenCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getViewedAt() {
        return viewedAt;
    }

    public void setViewedAt(LocalDateTime viewedAt) {
        this.viewedAt = viewedAt;
    }

    public Boolean getSaved() {
        return isSaved;
    }

    public void setSaved(Boolean saved) {
        isSaved = saved;
    }
}