package com.conceptbridge.service.impl;

import com.conceptbridge.dto.response.DashboardResponse;
import com.conceptbridge.entity.Assessment;
import com.conceptbridge.entity.Project;
import com.conceptbridge.entity.StudentResponse;
import com.conceptbridge.repository.*;
import com.conceptbridge.service.DashboardService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final TopicRepository topicRepository;
    private final AssessmentRepository assessmentRepository;
    private final ProjectRepository projectRepository;
    private final ResponseRepository responseRepository;

    public DashboardServiceImpl(UserRepository userRepository,
                                TopicRepository topicRepository,
                                AssessmentRepository assessmentRepository,
                                ProjectRepository projectRepository,
                                ResponseRepository responseRepository) {
        this.userRepository = userRepository;
        this.topicRepository = topicRepository;
        this.assessmentRepository = assessmentRepository;
        this.projectRepository = projectRepository;
        this.responseRepository = responseRepository;
    }

    @Override
    public DashboardResponse getStudentDashboard(Long studentId) {
        // Get student's projects
        List<Project> projects = projectRepository.findByStudentId(studentId);
        Long totalProjects = (long) projects.size();
        Long completedProjects = projects.stream()
                .filter(p -> "COMPLETED".equals(p.getProjectStatus()))
                .count();

        // Get recent responses
        List<StudentResponse> recentResponses = responseRepository.findByStudentId(studentId)
                .stream()
                .limit(5)
                .toList();

        // Calculate average performance
        Double averagePerformance = responseRepository.findAverageScoreByAssessmentId(studentId);

        DashboardResponse response = new DashboardResponse();
        response.setTotalCount(totalProjects);
        response.setActiveCount(completedProjects);
        response.setAveragePerformance(averagePerformance != null ? averagePerformance : 0.0);
        response.setRecentActivities(recentResponses);

        // Add statistics
        Map<String, Long> statistics = new HashMap<>();
        statistics.put("totalProjects", totalProjects);
        statistics.put("completedProjects", completedProjects);
        statistics.put("pendingAssessments", getPendingAssessmentsCount(studentId));
        response.setStatistics(statistics);

        return response;
    }

    @Override
    public DashboardResponse getTeacherDashboard(Long teacherId) {
        // Get teacher's statistics
        Long totalStudents = (long) userRepository.findByRole("STUDENT").size();
        Long activeTopics = topicRepository.findByTeacherId(teacherId)
                .stream()
                .filter(t -> t.getIsActive())
                .count();
        Long totalAssessments = (long) assessmentRepository.findByTeacherId(teacherId).size();

        // Get recent assessments
        List<Assessment> recentAssessments = assessmentRepository.findByTeacherId(teacherId)
                .stream()
                .limit(5)
                .toList();

        DashboardResponse response = new DashboardResponse();
        response.setTotalCount(totalStudents);
        response.setActiveCount(activeTopics);
        response.setAveragePerformance(calculateTeacherAveragePerformance(teacherId));
        response.setRecentActivities(recentAssessments);

        // Add statistics
        Map<String, Long> statistics = new HashMap<>();
        statistics.put("totalStudents", totalStudents);
        statistics.put("activeTopics", activeTopics);
        statistics.put("totalAssessments", totalAssessments);
        statistics.put("pendingResponses", getPendingResponsesCount(teacherId));
        response.setStatistics(statistics);

        return response;
    }

    @Override
    public DashboardResponse getAdminDashboard() {
        Long totalUsers = userRepository.count();
        Long activeUsers = (long) userRepository.findAllActiveUsers().size();
        Long totalTopics = topicRepository.count();

        DashboardResponse response = new DashboardResponse();
        response.setTotalCount(totalUsers);
        response.setActiveCount(activeUsers);
        response.setAveragePerformance(calculatePlatformAveragePerformance());

        // Add platform statistics
        Map<String, Long> statistics = new HashMap<>();
        statistics.put("totalUsers", totalUsers);
        statistics.put("activeUsers", activeUsers);
        statistics.put("totalTopics", totalTopics);
        statistics.put("totalAssessments", assessmentRepository.count());
        statistics.put("totalProjects", projectRepository.count());
        response.setStatistics(statistics);

        return response;
    }

    private Long getPendingAssessmentsCount(Long studentId) {
        // Implementation for pending assessments count
        return 0L; // Placeholder
    }

    private Long getPendingResponsesCount(Long teacherId) {
        // Implementation for pending responses count
        return 0L; // Placeholder
    }

    private Double calculateTeacherAveragePerformance(Long teacherId) {
        // Calculate average performance for teacher's students
        List<Assessment> assessments = assessmentRepository.findByTeacherId(teacherId);
        if (assessments.isEmpty()) {
            return 0.0;
        }

        double totalAverage = assessments.stream()
                .mapToDouble(a -> responseRepository.findAverageScoreByAssessmentId(a.getId()) != null ?
                        responseRepository.findAverageScoreByAssessmentId(a.getId()) : 0.0)
                .average()
                .orElse(0.0);

        return totalAverage;
    }

    private Double calculatePlatformAveragePerformance() {
        // Calculate average performance across the platform
        List<Assessment> assessments = assessmentRepository.findAll();
        if (assessments.isEmpty()) {
            return 0.0;
        }

        double totalAverage = assessments.stream()
                .mapToDouble(a -> responseRepository.findAverageScoreByAssessmentId(a.getId()) != null ?
                        responseRepository.findAverageScoreByAssessmentId(a.getId()) : 0.0)
                .average()
                .orElse(0.0);

        return totalAverage;
    }
}