package com.conceptbridge.service;

import com.conceptbridge.dto.ProjectDTO;
import com.conceptbridge.dto.StudentDTO;
import com.conceptbridge.dto.StudentResponseDTO;
import com.conceptbridge.dto.request.ProjectRequest;
import com.conceptbridge.dto.response.DashboardResponse;
import com.conceptbridge.entity.Explanation;
import com.conceptbridge.entity.Project;
import com.conceptbridge.entity.StudentResponse;
import com.conceptbridge.entity.Student;

import java.util.List;

public interface StudentService {
    List<Explanation> getExplanationsForTopic(Long topicId, Long studentId);
    ProjectDTO createProject(ProjectRequest projectRequest);
    StudentResponse submitAssessmentResponse(StudentResponse response);
    StudentDTO getStudentDashboard(Long studentId);
    List<Project> getStudentProjects(Long studentId);
    Explanation getPersonalizedExplanation(Long topicId, Long studentId);
    List<StudentResponse> getStudentResponses(Long studentId);
    List<ProjectDTO> getStudentProjectDTOs(Long id);
    List<StudentResponseDTO> getStudentResponseDTOs(Long id);
    ProjectDTO updateProjectProgress(Long projectId, Double progress, Long studentId);

}