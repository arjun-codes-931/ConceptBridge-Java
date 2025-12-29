package com.conceptbridge.service.impl;

import com.conceptbridge.dto.QuestionDTO.TopicDTO;
import com.conceptbridge.entity.Topic;
import com.conceptbridge.repository.TopicRepository;
import com.conceptbridge.service.TopicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TopicServiceImpl implements TopicService {

    @Autowired
    private TopicRepository topicRepository;

    @Override
    public List<TopicDTO> getAllActiveTopics() {
        List<Topic> topics = topicRepository.findAllActiveTopics();
        return topics.stream()
                .map(TopicDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public Page<TopicDTO> getActiveTopics(Pageable pageable) {
        Page<Topic> topics = topicRepository.findAllByIsActiveTrue(pageable);
        return topics.map(TopicDTO::new);
    }

    @Override
    public List<TopicDTO> getTopicsByCategory(String category) {
        List<Topic> topics = topicRepository.findByCategory(category);
        return topics.stream()
                .map(TopicDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<TopicDTO> getTopicsByComplexityLevel(Integer complexityLevel) {
        List<Topic> topics = topicRepository.findByComplexityLevel(complexityLevel);
        return topics.stream()
                .map(TopicDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<TopicDTO> searchTopics(String keyword) {
        List<Topic> topics = topicRepository.findByTitleOrDescriptionContaining(keyword);
        return topics.stream()
                .map(TopicDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public TopicDTO getTopicById(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + id));
        return new TopicDTO(topic);
    }

    @Override
    public List<String> getAllCategories() {
        List<Topic> topics = topicRepository.findAllActiveTopics();
        return topics.stream()
                .map(Topic::getCategory)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
}