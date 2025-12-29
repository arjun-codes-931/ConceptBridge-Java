package com.conceptbridge.dto.AiDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public class ExplanationRequest {

    @NotBlank(message = "Content is required")
    @Size(max = 5000, message = "Content too long. Max 5000 characters.")
    private String content;

    private String language = "English";
    private String complexity = "simple";
    private Long pdfId;



    public ExplanationRequest() {
    }

    public ExplanationRequest(String content, String language, String complexity, Long pdfId) {
        this.content = content;
        this.language = language;
        this.complexity = complexity;
        this.pdfId = pdfId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
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

    public Long getPdfId() {
        return pdfId;
    }

    public void setPdfId(Long pdfId) {
        this.pdfId = pdfId;
    }
}