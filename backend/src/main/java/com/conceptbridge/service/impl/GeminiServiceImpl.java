package com.conceptbridge.service.impl;

import com.conceptbridge.dto.AiDTO.ExplanationRequest;
import com.conceptbridge.dto.AiDTO.ExplanationResponse;
import com.conceptbridge.entity.AIExplanationHistory;
import com.conceptbridge.entity.PDFDocument;
import com.conceptbridge.entity.User;
import com.conceptbridge.exception.RateLimitExceededException;
import com.conceptbridge.exception.ServiceException;
import com.conceptbridge.repository.AIExplanationHistoryRepository;
import com.conceptbridge.repository.PDFDocumentRepository;
import com.conceptbridge.service.GeminiService;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class GeminiServiceImpl implements GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiServiceImpl.class);

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.max-daily-requests:20}")
    private int maxDailyRequests;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

    private final WebClient webClient;
    private final AIExplanationHistoryRepository historyRepository;
    private final PDFDocumentRepository pdfDocumentRepository;

    @Autowired
    public GeminiServiceImpl(WebClient webClient,
                             AIExplanationHistoryRepository historyRepository,
                             PDFDocumentRepository pdfDocumentRepository) {
        this.webClient = webClient;
        this.historyRepository = historyRepository;
        this.pdfDocumentRepository = pdfDocumentRepository;
    }

    @Override
    public ExplanationResponse explainContent(ExplanationRequest request, User student) {
        // Rate limiting check
        Integer todayCount = historyRepository.countExplanationsByDate(
                student.getId(), LocalDate.now());

        if (todayCount >= maxDailyRequests) {
            throw new RateLimitExceededException(
                    String.format("Daily limit reached (%d requests). Please try again tomorrow.", maxDailyRequests));
        }

        try {
            // Build prompt
            String prompt = buildPrompt(request);

            // Call Gemini API
            GeminiApiResponse apiResponse = callGeminiApi(prompt);

            // Extract explanation
            String explanation = extractExplanation(apiResponse);
            int tokenCount = apiResponse.getUsageMetadata().getTotalTokenCount();

            // Save to history
            AIExplanationHistory history = saveHistory(request, student, explanation, tokenCount);

            return new ExplanationResponse(
                    explanation,
                    tokenCount,
                    OffsetDateTime.now(),
                    "gemini-pro",
                    history.getId()
            );

        } catch (Exception e) {
            log.error("Gemini API call failed", e);
            throw new ServiceException("Failed to generate explanation: " + e.getMessage(), e);
        }
    }

    private String buildPrompt(ExplanationRequest request) {
        return String.format("""
            You are an expert teacher explaining concepts to students.
            
            TASK: Explain the following content in very simple terms.
            
            CONTENT TO EXPLAIN:
            %s
            
            REQUIREMENTS:
            1. Use simple, everyday language that a 15-year-old can understand
            2. Break down complex ideas into smaller parts
            3. Use relatable analogies and examples
            4. Keep paragraphs short (2-3 sentences max)
            5. Be encouraging and positive
            6. Target explanation for '%s' level
            7. Use '%s' language
            8. Format with clear headings and bullet points
            9. Add 2-3 relevant emojis to make it friendly
            10. Provide 3 key takeaways at the end
            
            FORMAT:
            ## 🎯 Simple Explanation
            [Your main explanation here]
            
            ## 📝 Key Takeaways
            • [Key point 1]
            • [Key point 2]
            • [Key point 3]
            
            ## 💡 Remember This
            [Memory tips or mnemonics]
            
            ## 🔗 Related Ideas
            [Brief mention of connected concepts]
            
            ## ❓ Think About
            [A thought-provoking question]
            """,
                request.getContent(),
                request.getComplexity(),
                request.getLanguage()
        );
    }

    private GeminiApiResponse callGeminiApi(String prompt) {
        String url = GEMINI_API_URL + "?key=" + geminiApiKey;

        GeminiRequest request = new GeminiRequest(
                List.of(new Content(List.of(new Part(prompt))))
        );

        return webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(GeminiApiResponse.class)
                .doOnError(error -> log.error("Gemini API error: {}", error.getMessage()))
                .onErrorResume(e -> {
                    log.error("Failed to call Gemini API", e);
                    throw new ServiceException("AI service temporarily unavailable");
                })
                .block();
    }

    private String extractExplanation(GeminiApiResponse response) {
        if (response == null || response.getCandidates() == null || response.getCandidates().isEmpty()) {
            throw new ServiceException("No response from AI service");
        }

        Candidate candidate = response.getCandidates().get(0);
        if (candidate.getContent() == null || candidate.getContent().getParts().isEmpty()) {
            throw new ServiceException("Empty response from AI");
        }

        return candidate.getContent().getParts().get(0).getText();
    }

    private AIExplanationHistory saveHistory(ExplanationRequest request, User student,
                                             String explanation, int tokenCount) {
        // Create history object using constructor instead of builder
        AIExplanationHistory history = new AIExplanationHistory();
        history.setStudent(student);
        history.setOriginalContent(request.getContent().length() > 1000 ?
                request.getContent().substring(0, 1000) + "..." : request.getContent());
        history.setExplanation(explanation);
        history.setLanguage(request.getLanguage());
        history.setComplexity(request.getComplexity());
        history.setTokenCount(tokenCount);
        history.setCreatedAt(LocalDateTime.now());

        if (request.getPdfId() != null) {
            Optional<PDFDocument> pdf = pdfDocumentRepository.findById(request.getPdfId());
            pdf.ifPresent(history::setPdfDocument);
        }

        return historyRepository.save(history);
    }

    // Gemini API DTOs
    private static class GeminiRequest {
        private List<Content> contents;

        public GeminiRequest(List<Content> contents) {
            this.contents = contents;
        }

        public List<Content> getContents() {
            return contents;
        }

        public void setContents(List<Content> contents) {
            this.contents = contents;
        }
    }

    private static class Content {
        private List<Part> parts;

        public Content(List<Part> parts) {
            this.parts = parts;
        }

        public List<Part> getParts() {
            return parts;
        }

        public void setParts(List<Part> parts) {
            this.parts = parts;
        }
    }

    private static class Part {
        private String text;

        public Part(String text) {
            this.text = text;
        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }
    }

    private static class GeminiApiResponse {
        private List<Candidate> candidates;
        private UsageMetadata usageMetadata;

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

    private static class Candidate {
        private Content content;
        private String finishReason;

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

    private static class UsageMetadata {
        @JsonProperty("promptTokenCount")
        private int promptTokenCount;

        @JsonProperty("candidatesTokenCount")
        private int candidatesTokenCount;

        @JsonProperty("totalTokenCount")
        private int totalTokenCount;

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
}