package com.conceptbridge.service;

import com.conceptbridge.dto.TopicDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TopicService {
    List<TopicDTO> getAllActiveTopics();
    Page<TopicDTO> getActiveTopics(Pageable pageable);
    List<TopicDTO> getTopicsByCategory(String category);
    List<TopicDTO> getTopicsByComplexityLevel(Integer complexityLevel);
    List<TopicDTO> searchTopics(String keyword);
    TopicDTO getTopicById(Long id);
    List<String> getAllCategories();
}