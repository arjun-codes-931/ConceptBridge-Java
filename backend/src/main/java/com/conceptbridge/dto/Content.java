package com.conceptbridge.dto;

import com.conceptbridge.service.impl.GeminiServiceImpl;
import lombok.Data;

import java.util.List;


public class Content {
    private List<Part> parts;

    public Content(List<Part> parts) {
        this.parts = parts;
    }

    public Content() {
    }

    public List<Part> getParts() {
        return parts;
    }

    public void setParts(List<Part> parts) {
        this.parts = parts;
    }
}