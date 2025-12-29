package com.conceptbridge.service;

import com.conceptbridge.dto.AiDTO.ExplanationRequest;
import com.conceptbridge.dto.AiDTO.ExplanationResponse;
import com.conceptbridge.entity.User;
import com.conceptbridge.exception.RateLimitExceededException;
import com.conceptbridge.exception.ServiceException;

/**
 * Service interface for AI-powered content explanation using Gemini API
 */
public interface GeminiService {

    /**
     * Generate an AI-powered explanation for given content
     *
     * @param request The explanation request containing content, complexity, language, etc.
     * @param student The user requesting the explanation (for rate limiting and history)
     * @return ExplanationResponse containing the generated explanation and metadata
     * @throws RateLimitExceededException if user exceeds daily request limit
     * @throws ServiceException if AI service fails or other errors occur
     */
    ExplanationResponse explainContent(ExplanationRequest request, User student);
}