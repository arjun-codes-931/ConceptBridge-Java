package com.conceptbridge.dto.AiDTO;

import com.fasterxml.jackson.annotation.JsonProperty;


public class UsageMetadata {
    @JsonProperty("promptTokenCount")
    private int promptTokenCount;

    @JsonProperty("candidatesTokenCount")
    private int candidatesTokenCount;

    @JsonProperty("totalTokenCount")
    private int totalTokenCount;

    public UsageMetadata() {
    }

    public UsageMetadata(int promptTokenCount, int candidatesTokenCount, int totalTokenCount) {
        this.promptTokenCount = promptTokenCount;
        this.candidatesTokenCount = candidatesTokenCount;
        this.totalTokenCount = totalTokenCount;
    }

    public int getPromptTokenCount() {
        return promptTokenCount;
    }

    public void setPromptTokenCount(int promptTokenCount) {
        this.promptTokenCount = promptTokenCount;
    }

    public int getCandidatesTokenCount() {
        return candidatesTokenCount;
    }

    public void setCandidatesTokenCount(int candidatesTokenCount) {
        this.candidatesTokenCount = candidatesTokenCount;
    }

    public int getTotalTokenCount() {
        return totalTokenCount;
    }

    public void setTotalTokenCount(int totalTokenCount) {
        this.totalTokenCount = totalTokenCount;
    }
}