package com.conceptbridge.dto.request;

import com.conceptbridge.entity.ExplanationFormat;
import jakarta.validation.constraints.NotNull;

public class ExplanationRequest {
    @NotNull
    private Long topicId;

    @NotNull
    private ExplanationFormat format;

    private String customPrompt;
    private Integer maxTokens;

    // Constructors
    public ExplanationRequest() {}

    public ExplanationRequest(Long topicId, ExplanationFormat format) {
        this.topicId = topicId;
        this.format = format;
    }

    // Getters and Setters
    public Long getTopicId() { return topicId; }
    public void setTopicId(Long topicId) { this.topicId = topicId; }

    public ExplanationFormat getFormat() { return format; }
    public void setFormat(ExplanationFormat format) { this.format = format; }

    public String getCustomPrompt() { return customPrompt; }
    public void setCustomPrompt(String customPrompt) { this.customPrompt = customPrompt; }

    public Integer getMaxTokens() { return maxTokens; }
    public void setMaxTokens(Integer maxTokens) { this.maxTokens = maxTokens; }
}