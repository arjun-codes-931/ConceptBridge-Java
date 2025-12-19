//package com.conceptbridge.service.impl;
//
//import com.conceptbridge.entity.Explanation;
//import com.conceptbridge.entity.ExplanationFormat;
//import com.conceptbridge.entity.Topic;
//import com.conceptbridge.repository.ExplanationRepository;
//import com.conceptbridge.repository.TopicRepository;
//import com.conceptbridge.service.ExplanationService;
////import org.springframework.ai.openai.OpenAiApi;
////import org.springframework.ai.openai.ChatCompletionRequest;
////import org.springframework.ai.openai.ChatCompletionResponse;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Optional;
//
//@Service
//@Transactional
//public class ExplanationServiceImpl implements ExplanationService {
//
//    private final ExplanationRepository explanationRepository;
//    private final TopicRepository topicRepository;
////    private final OpenAiApi openAiApi;
//
//    public ExplanationServiceImpl(ExplanationRepository explanationRepository,
//                                  TopicRepository topicRepository,
//                                  OpenAiApi openAiApi) {
//        this.explanationRepository = explanationRepository;
//        this.topicRepository = topicRepository;
//        this.openAiApi = openAiApi;
//    }
//
//    @Override
//    public Explanation generateAIExplanation(String topicTitle, ExplanationFormat format) {
//        // Create prompt based on format
//        String prompt = createPrompt(topicTitle, format);
//
//        // Call OpenAI API
//        ChatCompletionRequest request = ChatCompletionRequest.builder()
//                .model("gpt-4")
//                .messages(List.of(new ChatCompletionRequest.Message("user", prompt)))
//                .maxTokens(500)
//                .build();
//
//        try {
//            ChatCompletionResponse response = openAiApi.createChatCompletion(request);
//            String generatedContent = response.getChoices().get(0).getMessage().getContent();
//
//            // Create and save explanation
//            Explanation explanation = new Explanation();
//            explanation.setContent(generatedContent);
//            explanation.setFormat(format);
//            explanation.setAiModelUsed("GPT-4");
//            explanation.setTokensUsed(response.getUsage().getTotalTokens());
//            explanation.setGenerationTime(2.5); // Mock value
//            explanation.setGeneratedAt(LocalDateTime.now());
//            explanation.setRating(0);
//            explanation.setUsageCount(0);
//
//            // Find or create topic (simplified - in real scenario, topic should exist)
//            Topic topic = topicRepository.findByTitleOrDescriptionContaining(topicTitle)
//                    .stream()
//                    .findFirst()
//                    .orElse(createDefaultTopic(topicTitle));
//
//            explanation.setTopic(topic);
//
//            return explanationRepository.save(explanation);
//        } catch (Exception e) {
//            // Fallback to mock explanation if AI service fails
//            return createMockExplanation(topicTitle, format);
//        }
//    }
//
//    @Override
//    public Explanation getExplanationById(Long explanationId) {
//        return explanationRepository.findById(explanationId)
//                .orElseThrow(() -> new RuntimeException("Explanation not found with id: " + explanationId));
//    }
//
//    @Override
//    public List<Explanation> getExplanationsByTopic(Long topicId) {
//        return explanationRepository.findByTopicId(topicId);
//    }
//
//    @Override
//    public Explanation personalizeExplanation(Long explanationId, Long studentId) {
//        Explanation explanation = getExplanationById(explanationId);
//
//        // Increment usage count
//        explanation.setUsageCount(explanation.getUsageCount() + 1);
//        explanationRepository.save(explanation);
//
//        // In a real implementation, you might personalize the content based on student's learning style
//        return explanation;
//    }
//
//    @Override
//    public void rateExplanation(Long explanationId, Integer rating) {
//        Explanation explanation = getExplanationById(explanationId);
//
//        // Simple average rating calculation
//        if (explanation.getRating() == null || explanation.getRating() == 0) {
//            explanation.setRating(rating);
//        } else {
//            int currentRating = explanation.getRating();
//            explanation.setRating((currentRating + rating) / 2);
//        }
//
//        explanationRepository.save(explanation);
//    }
//
//    @Override
//    public List<Explanation> getTopRatedExplanations(Integer limit) {
//        return explanationRepository.findAll()
//                .stream()
//                .filter(e -> e.getRating() != null && e.getRating() >= 4)
//                .limit(limit != null ? limit : 10)
//                .toList();
//    }
//
//    private String createPrompt(String topicTitle, ExplanationFormat format) {
//        return switch (format) {
//            case STEP_BY_STEP ->
//                    "Explain the concept of '" + topicTitle + "' in a step-by-step manner. " +
//                            "Break it down into clear, sequential steps that are easy to follow.";
//            case ANALOGY ->
//                    "Explain the concept of '" + topicTitle + "' using a relatable analogy. " +
//                            "Compare it to something from everyday life to make it easier to understand.";
//            case CODE_EXAMPLE ->
//                    "Explain the concept of '" + topicTitle + "' with practical code examples. " +
//                            "Provide working code snippets that demonstrate the concept in action.";
//            case DIAGRAM ->
//                    "Explain the concept of '" + topicTitle + "' visually. " +
//                            "Describe it in a way that could be easily represented as a diagram or flowchart.";
//            case REAL_WORLD_EXAMPLE ->
//                    "Explain the concept of '" + topicTitle + "' using real-world applications. " +
//                            "Show how this concept is used in practical scenarios or industries.";
//            case VISUAL_REPRESENTATION ->
//                    "Explain the concept of '" + topicTitle + "' focusing on visual elements. " +
//                            "Describe colors, shapes, spatial relationships that help understand the concept.";
//        };
//    }
//
//    private Topic createDefaultTopic(String title) {
//        Topic topic = new Topic();
//        topic.setTitle(title);
//        topic.setDescription("Auto-generated topic for explanation");
//        topic.setCreatedAt(LocalDateTime.now());
//        topic.setIsActive(true);
//        return topicRepository.save(topic);
//    }
//
//    private Explanation createMockExplanation(String topicTitle, ExplanationFormat format) {
//        Explanation explanation = new Explanation();
//        explanation.setContent("This is a mock explanation for '" + topicTitle +
//                "' in " + format + " format. The AI service is currently unavailable.");
//        explanation.setFormat(format);
//        explanation.setAiModelUsed("Mock Service");
//        explanation.setTokensUsed(100);
//        explanation.setGenerationTime(1.0);
//        explanation.setGeneratedAt(LocalDateTime.now());
//        explanation.setRating(0);
//        explanation.setUsageCount(0);
//
//        Topic topic = createDefaultTopic(topicTitle);
//        explanation.setTopic(topic);
//
//        return explanationRepository.save(explanation);
//    }
//}