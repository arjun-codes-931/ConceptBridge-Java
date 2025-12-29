package com.conceptbridge.dto.AiDTO;

import java.time.OffsetDateTime;


public class ExplanationResponse {
    private String explanation;
    private Integer tokenCount;
    private OffsetDateTime generatedAt;
    private String modelUsed;
    private Long historyId;

    public ExplanationResponse() {
    }

    public ExplanationResponse(String explanation, Integer tokenCount, OffsetDateTime generatedAt, String modelUsed, Long historyId) {
        this.explanation = explanation;
        this.tokenCount = tokenCount;
        this.generatedAt = generatedAt;
        this.modelUsed = modelUsed;
        this.historyId = historyId;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public Integer getTokenCount() {
        return tokenCount;
    }

    public void setTokenCount(Integer tokenCount) {
        this.tokenCount = tokenCount;
    }

    public OffsetDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(OffsetDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public String getModelUsed() {
        return modelUsed;
    }

    public void setModelUsed(String modelUsed) {
        this.modelUsed = modelUsed;
    }

    public Long getHistoryId() {
        return historyId;
    }

    public void setHistoryId(Long historyId) {
        this.historyId = historyId;
    }
}