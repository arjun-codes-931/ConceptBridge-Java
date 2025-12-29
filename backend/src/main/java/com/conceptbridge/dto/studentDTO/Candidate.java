package com.conceptbridge.dto.studentDTO;

import com.conceptbridge.dto.Content;


public class Candidate {
    private Content content;
    private String finishReason;

    public Candidate() {
    }

    public Candidate(Content content, String finishReason) {
        this.content = content;
        this.finishReason = finishReason;
    }

    public Content getContent() {
        return content;
    }

    public void setContent(Content content) {
        this.content = content;
    }

    public String getFinishReason() {
        return finishReason;
    }

    public void setFinishReason(String finishReason) {
        this.finishReason = finishReason;
    }
}