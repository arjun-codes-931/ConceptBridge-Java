package com.conceptbridge.service;

import com.conceptbridge.entity.Explanation;
import com.conceptbridge.entity.ExplanationFormat;

import java.util.List;

public interface ExplanationService {
    Explanation generateAIExplanation(String topic, ExplanationFormat format);
    Explanation getExplanationById(Long explanationId);
    List<Explanation> getExplanationsByTopic(Long topicId);
    Explanation personalizeExplanation(Long explanationId, Long studentId);
    void rateExplanation(Long explanationId, Integer rating);
    List<Explanation> getTopRatedExplanations(Integer limit);
}