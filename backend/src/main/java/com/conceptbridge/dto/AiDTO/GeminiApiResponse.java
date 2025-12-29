package com.conceptbridge.dto.AiDTO;

import com.conceptbridge.dto.studentDTO.Candidate;

import java.util.List;


public class GeminiApiResponse {
    private List<Candidate> candidates;
    private UsageMetadata usageMetadata;

    public GeminiApiResponse(List<Candidate> candidates, UsageMetadata usageMetadata) {
        this.candidates = candidates;
        this.usageMetadata = usageMetadata;
    }

    public GeminiApiResponse() {
    }

    public List<Candidate> getCandidates() {
        return candidates;
    }

    public void setCandidates(List<Candidate> candidates) {
        this.candidates = candidates;
    }

    public UsageMetadata getUsageMetadata() {
        return usageMetadata;
    }

    public void setUsageMetadata(UsageMetadata usageMetadata) {
        this.usageMetadata = usageMetadata;
    }
}