package com.conceptbridge.dto.AiDTO;

import com.conceptbridge.dto.Content;

import java.util.List;

// Gemini API DTOs
public class GeminiRequest {
    private List<Content> contents;

    public GeminiRequest(List<Content> contents) {
        this.contents = contents;
    }

    public GeminiRequest() {
    }

    public List<Content> getContents() {
        return contents;
    }

    public void setContents(List<Content> contents) {
        this.contents = contents;
    }
}