package com.conceptbridge.service;

import com.conceptbridge.dto.request.TopicRequest;
import com.conceptbridge.dto.request.ExplanationRequest;
import com.conceptbridge.dto.request.AssessmentRequest;
import com.conceptbridge.dto.response.DashboardResponse;
import com.conceptbridge.entity.Topic;
import com.conceptbridge.entity.Explanation;
import com.conceptbridge.entity.Assessment;
import com.conceptbridge.entity.Student;
import com.conceptbridge.entity.ComprehensionMetrics;

import java.util.List;

public interface TeacherService {
    Topic createTopic(TopicRequest topicRequest, Long teacherId);
    List<Topic> getTeacherTopics(Long teacherId);
    Explanation generateExplanation(ExplanationRequest explanationRequest);
    Assessment createAssessment(AssessmentRequest assessmentRequest);
    DashboardResponse getTeacherDashboard(Long teacherId);
    List<Student> getTeacherStudents(Long teacherId);
    ComprehensionMetrics getTopicComprehension(Long topicId);
    List<Assessment> getTeacherAssessments(Long teacherId);
    Long getTotalStudentsCount(Long teacherId);
    Long getActiveTopicsCount(Long teacherId);
}