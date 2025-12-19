package com.conceptbridge.controller;

import com.conceptbridge.dto.TopicDTO;
import com.conceptbridge.entity.Topic;
import com.conceptbridge.repository.TopicRepository;
import com.conceptbridge.service.impl.TopicServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/student/topics")
public class TopicController {

    @Autowired
    private TopicServiceImpl topicService;
    @Autowired
    private TopicRepository topicRepository;

    // Get all active topics
    @GetMapping
    public ResponseEntity<List<TopicDTO>> getAllActiveTopics() {
        try {
            List<TopicDTO> topics = topicService.getAllActiveTopics();
            System.out.println("topiccccccccccc try");
            return ResponseEntity.ok(topics);
        } catch (Exception e) {
            System.out.println("topiccccccccccc catch ");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get topics with pagination
    @GetMapping("/page")
    public ResponseEntity<Page<TopicDTO>> getActiveTopics(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        System.out.println("topiccccccccccc try");

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("title"));
            Page<TopicDTO> topics = topicService.getActiveTopics(pageable);
            return ResponseEntity.ok(topics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get topic by ID
    @GetMapping("/{id}")
    public ResponseEntity<TopicDTO> getTopicById(@PathVariable Long id) {
        System.out.println("topiccccccccccc try");

        try {
            TopicDTO topic = topicService.getTopicById(id);
            return ResponseEntity.ok(topic);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get topics by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<TopicDTO>> getTopicsByCategory(@PathVariable String category) {
        System.out.println("topiccccccccccc try");

        try {
            List<TopicDTO> topics = topicService.getTopicsByCategory(category);
            return ResponseEntity.ok(topics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get topics by complexity level
    @GetMapping("/complexity/{level}")
    public ResponseEntity<List<TopicDTO>> getTopicsByComplexityLevel(@PathVariable Integer level) {
        System.out.println("topiccccccccccc try");

        try {
            List<TopicDTO> topics = topicService.getTopicsByComplexityLevel(level);
            return ResponseEntity.ok(topics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Search topics
    @GetMapping("/search")
    public ResponseEntity<List<TopicDTO>> searchTopics(@RequestParam String q) {
        System.out.println("topiccccccccccc try");

        try {
            if (q == null || q.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.emptyList());
            }
            List<TopicDTO> topics = topicService.searchTopics(q.trim());
            return ResponseEntity.ok(topics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get all available categories
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        System.out.println("topiccccccccccc try");

        try {
            List<String> categories = topicService.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get topics with filters (category and complexity)
    @GetMapping("/filter")
    public ResponseEntity<List<TopicDTO>> getTopicsWithFilters(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer complexityLevel) {
        System.out.println("topiccccccccccc try");

        try {
            List<Topic> filteredTopics;

            if (category != null && complexityLevel != null) {
                // Filter by both category and complexity
                List<Topic> byCategory = topicRepository.findByCategory(category);
                filteredTopics = byCategory.stream()
                        .filter(topic -> topic.getComplexityLevel().equals(complexityLevel) && topic.getIsActive())
                        .collect(Collectors.toList());
            } else if (category != null) {
                // Filter by category only
                filteredTopics = topicRepository.findByCategory(category).stream()
                        .filter(Topic::getIsActive)
                        .collect(Collectors.toList());
            } else if (complexityLevel != null) {
                // Filter by complexity only
                filteredTopics = topicRepository.findByComplexityLevel(complexityLevel).stream()
                        .filter(Topic::getIsActive)
                        .collect(Collectors.toList());
            } else {
                // No filters, return all active topics
                filteredTopics = topicRepository.findAllActiveTopics();
            }

            List<TopicDTO> result = filteredTopics.stream()
                    .map(TopicDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}