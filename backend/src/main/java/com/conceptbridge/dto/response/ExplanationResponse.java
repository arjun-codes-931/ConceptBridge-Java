package com.conceptbridge.dto.response;

import com.conceptbridge.entity.ExplanationFormat;
import java.time.LocalDateTime;

public class ExplanationResponse {
    private Long id;
    private String content;
    private ExplanationFormat format;
    private Long topicId;
    private String topicTitle;
    private String aiModelUsed;
    private Integer tokensUsed;
    private Double generationTime;
    private LocalDateTime generatedAt;
    private Integer rating;
    private Integer usageCount;

    // Constructors
    public ExplanationResponse() {}

    public ExplanationResponse(Long id, String content, ExplanationFormat format, Long topicId, String topicTitle) {
        this.id = id;
        this.content = content;
        this.format = format;
        this.topicId = topicId;
        this.topicTitle = topicTitle;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public ExplanationFormat getFormat() { return format; }
    public void setFormat(ExplanationFormat format) { this.format = format; }

    public Long getTopicId() { return topicId; }
    public void setTopicId(Long topicId) { this.topicId = topicId; }

    public String getTopicTitle() { return topicTitle; }
    public void setTopicTitle(String topicTitle) { this.topicTitle = topicTitle; }

    public String getAiModelUsed() { return aiModelUsed; }
    public void setAiModelUsed(String aiModelUsed) { this.aiModelUsed = aiModelUsed; }

    public Integer getTokensUsed() { return tokensUsed; }
    public void setTokensUsed(Integer tokensUsed) { this.tokensUsed = tokensUsed; }

    public Double getGenerationTime() { return generationTime; }
    public void setGenerationTime(Double generationTime) { this.generationTime = generationTime; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public Integer getUsageCount() { return usageCount; }
    public void setUsageCount(Integer usageCount) { this.usageCount = usageCount; }
}