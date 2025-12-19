package com.conceptbridge.service.impl;

import com.conceptbridge.dto.request.TopicRequest;
import com.conceptbridge.dto.request.ExplanationRequest;
import com.conceptbridge.dto.request.AssessmentRequest;
import com.conceptbridge.dto.response.DashboardResponse;
import com.conceptbridge.entity.*;
import com.conceptbridge.repository.*;
import com.conceptbridge.service.TeacherService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class TeacherServiceImpl implements TeacherService {

    private final TopicRepository topicRepository;
    private final ExplanationRepository explanationRepository;
    private final AssessmentRepository assessmentRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ComprehensionMetricsRepository comprehensionMetricsRepository;

    public TeacherServiceImpl(TopicRepository topicRepository,
                              ExplanationRepository explanationRepository,
                              AssessmentRepository assessmentRepository,
                              StudentRepository studentRepository,
                              TeacherRepository teacherRepository,
                              ComprehensionMetricsRepository comprehensionMetricsRepository) {
        this.topicRepository = topicRepository;
        this.explanationRepository = explanationRepository;
        this.assessmentRepository = assessmentRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.comprehensionMetricsRepository = comprehensionMetricsRepository;
    }

    @Override
    public Topic createTopic(TopicRequest topicRequest, Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + teacherId));

        Topic topic = new Topic();
        topic.setTitle(topicRequest.getTitle());
        topic.setDescription(topicRequest.getDescription());
        topic.setCategory(topicRequest.getCategory());
        topic.setComplexityLevel(topicRequest.getComplexityLevel());
        topic.setTeacher(teacher);
        topic.setCreatedAt(LocalDateTime.now());
        topic.setUpdatedAt(LocalDateTime.now());
        topic.setIsActive(true);

        return topicRepository.save(topic);
    }

    @Override
    public List<Topic> getTeacherTopics(Long teacherId) {
        return topicRepository.findByTeacherId(teacherId);
    }

    @Override
    public Explanation generateExplanation(ExplanationRequest explanationRequest) {
        Topic topic = topicRepository.findById(explanationRequest.getTopicId())
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + explanationRequest.getTopicId()));

        // This would integrate with AI service - for now, creating a mock explanation
        Explanation explanation = new Explanation();
        explanation.setTopic(topic);
        explanation.setFormat(explanationRequest.getFormat());
        explanation.setContent("This is a generated explanation for: " + topic.getTitle() +
                " in format: " + explanationRequest.getFormat());
        explanation.setAiModelUsed("GPT-4");
        explanation.setTokensUsed(150);
        explanation.setGenerationTime(2.5);
        explanation.setGeneratedAt(LocalDateTime.now());
        explanation.setRating(0);
        explanation.setUsageCount(0);

        return explanationRepository.save(explanation);
    }

    @Override
    public Assessment createAssessment(AssessmentRequest assessmentRequest) {
        Teacher teacher = teacherRepository.findById(assessmentRequest.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + assessmentRequest.getTeacherId()));

        Topic topic = topicRepository.findById(assessmentRequest.getTopicId())
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + assessmentRequest.getTopicId()));

        Assessment assessment = new Assessment();
        assessment.setTitle(assessmentRequest.getTitle());
        assessment.setType(assessmentRequest.getType());
        assessment.setTeacher(teacher);
        assessment.setTopic(topic);
        assessment.setCreatedAt(LocalDateTime.now());
        assessment.setDueDate(assessmentRequest.getDueDate());
        assessment.setTimeLimit(assessmentRequest.getTimeLimit());
        assessment.setMaxAttempts(assessmentRequest.getMaxAttempts());
        assessment.setIsActive(true);
        assessment.setPassingScore(assessmentRequest.getPassingScore());

        return assessmentRepository.save(assessment);
    }

    @Override
    public DashboardResponse getTeacherDashboard(Long teacherId) {
        Long totalStudents = getTotalStudentsCount(teacherId);
        Long activeTopics = getActiveTopicsCount(teacherId);
        Long totalAssessments = (long) assessmentRepository.findByTeacherId(teacherId).size();

        List<Assessment> recentAssessments = assessmentRepository.findByTeacherId(teacherId)
                .stream()
                .limit(5)
                .toList();

        // Use totalAssessments as Double for averagePerformance (quick fix)
        Double averagePerformance = totalAssessments.doubleValue();

        Map<String, Long> statistics = new HashMap<>();
        statistics.put("totalStudents", totalStudents);
        statistics.put("activeTopics", activeTopics);
        statistics.put("totalAssessments", totalAssessments);

        return new DashboardResponse(totalStudents, activeTopics, averagePerformance, recentAssessments, statistics);
    }

    @Override
    public List<Student> getTeacherStudents(Long teacherId) {
        return studentRepository.findByTeacherId(teacherId);
    }

    @Override
    public ComprehensionMetrics getTopicComprehension(Long topicId) {
        // This would aggregate comprehension data from all students for the topic
        Double averageComprehension = comprehensionMetricsRepository.findAverageComprehensionByTopicId(topicId);

        ComprehensionMetrics metrics = new ComprehensionMetrics();
        metrics.setComprehensionScore(averageComprehension != null ? averageComprehension : 0.0);
        metrics.setTotalAttempts(100); // Mock data
        metrics.setCorrectAttempts(75); // Mock data
        metrics.setAverageTimePerQuestion(45.5); // Mock data
        metrics.setLastUpdated(LocalDateTime.now());

        return metrics;
    }

    @Override
    public List<Assessment> getTeacherAssessments(Long teacherId) {
        return assessmentRepository.findByTeacherId(teacherId);
    }

    @Override
    public Long getTotalStudentsCount(Long teacherId) {
        return (long) studentRepository.findByTeacherId(teacherId).size();
    }

    @Override
    public Long getActiveTopicsCount(Long teacherId) {
        return topicRepository.findByTeacherId(teacherId)
                .stream()
                .filter(Topic::getIsActive)
                .count();
    }
}