package com.conceptbridge.controller.TeacherController;

import com.conceptbridge.dto.request.TopicRequest;
import com.conceptbridge.dto.request.ExplanationRequest;
import com.conceptbridge.dto.request.AssessmentRequest;
import com.conceptbridge.dto.response.DashboardResponse;
import com.conceptbridge.entity.Topic;
import com.conceptbridge.entity.Explanation;
import com.conceptbridge.entity.Assessment;
import com.conceptbridge.entity.Student;
import com.conceptbridge.entity.ComprehensionMetrics;
import com.conceptbridge.service.TeacherService;
import com.conceptbridge.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @PostMapping("/topics")
    public ResponseEntity<Topic> createTopic(@RequestBody TopicRequest topicRequest,
                                             Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Topic topic = teacherService.createTopic(topicRequest, userPrincipal.getId());
        return ResponseEntity.ok(topic);
    }

    @GetMapping("/topics")
    public ResponseEntity<List<Topic>> getTeacherTopics(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<Topic> topics = teacherService.getTeacherTopics(userPrincipal.getId());
        return ResponseEntity.ok(topics);
    }

    @PostMapping("/explanations/generate")
    public ResponseEntity<Explanation> generateExplanation(@RequestBody ExplanationRequest explanationRequest) {
        Explanation explanation = teacherService.generateExplanation(explanationRequest);
        return ResponseEntity.ok(explanation);
    }

    @PostMapping("/assessments")
    public ResponseEntity<Assessment> createAssessment(@RequestBody AssessmentRequest assessmentRequest) {
        Assessment assessment = teacherService.createAssessment(assessmentRequest);
        return ResponseEntity.ok(assessment);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getTeacherDashboard(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        DashboardResponse dashboard = teacherService.getTeacherDashboard(userPrincipal.getId());
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getTeacherStudents(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<Student> students = teacherService.getTeacherStudents(userPrincipal.getId());
        return ResponseEntity.ok(students);
    }

    @GetMapping("/topics/{topicId}/comprehension")
    public ResponseEntity<ComprehensionMetrics> getTopicComprehension(@PathVariable Long topicId) {
        ComprehensionMetrics metrics = teacherService.getTopicComprehension(topicId);
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/assessments")
    public ResponseEntity<List<Assessment>> getTeacherAssessments(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<Assessment> assessments = teacherService.getTeacherAssessments(userPrincipal.getId());
        return ResponseEntity.ok(assessments);
    }
}