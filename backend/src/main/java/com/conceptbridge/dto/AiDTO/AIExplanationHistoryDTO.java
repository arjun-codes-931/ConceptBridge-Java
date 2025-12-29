package com.conceptbridge.dto.AiDTO;


public class AIExplanationHistoryDTO {
    private Long id;
    private String pdfTitle;
    private String originalContentPreview;
    private String explanationPreview;
    private String createdAt;
    private Integer tokenCount;
    private Boolean isSaved;

    public AIExplanationHistoryDTO() {
    }

    public AIExplanationHistoryDTO(Long id, String pdfTitle, String originalContentPreview, String explanationPreview, String createdAt, Integer tokenCount, Boolean isSaved) {
        this.id = id;
        this.pdfTitle = pdfTitle;
        this.originalContentPreview = originalContentPreview;
        this.explanationPreview = explanationPreview;
        this.createdAt = createdAt;
        this.tokenCount = tokenCount;
        this.isSaved = isSaved;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPdfTitle() {
        return pdfTitle;
    }

    public void setPdfTitle(String pdfTitle) {
        this.pdfTitle = pdfTitle;
    }

    public String getOriginalContentPreview() {
        return originalContentPreview;
    }

    public void setOriginalContentPreview(String originalContentPreview) {
        this.originalContentPreview = originalContentPreview;
    }

    public String getExplanationPreview() {
        return explanationPreview;
    }

    public void setExplanationPreview(String explanationPreview) {
        this.explanationPreview = explanationPreview;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getTokenCount() {
        return tokenCount;
    }

    public void setTokenCount(Integer tokenCount) {
        this.tokenCount = tokenCount;
    }

    public Boolean getSaved() {
        return isSaved;
    }

    public void setSaved(Boolean saved) {
        isSaved = saved;
    }
}