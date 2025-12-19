package com.conceptbridge.service.impl;

import com.conceptbridge.dto.ProjectDTO;
import com.conceptbridge.dto.StudentDTO;
import com.conceptbridge.dto.StudentResponseDTO;
import com.conceptbridge.dto.request.ProjectRequest;
import com.conceptbridge.dto.response.DashboardResponse;
import com.conceptbridge.entity.*;
import com.conceptbridge.repository.*;
import com.conceptbridge.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentServiceImpl implements StudentService {
    @Autowired
    private  ExplanationRepository explanationRepository;
    @Autowired
    private  ProjectRepository projectRepository;
    @Autowired
    private  StudentResponseRepository studentResponseRepository;
    @Autowired
    private  StudentRepository studentRepository;
    @Autowired
    private  TopicRepository topicRepository;
    @Autowired
    private  AssessmentRepository assessmentRepository;


    @Override
    public List<Explanation> getExplanationsForTopic(Long topicId, Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        // Get student's learning style and personalize explanations
        String learningStyle = student.getLearningStyle();

        List<Explanation> explanations = explanationRepository.findByTopicId(topicId);

        // Sort explanations based on student's learning style preference
        explanations.sort((e1, e2) -> {
            // Simple prioritization based on learning style
            if (learningStyle != null) {
                if (learningStyle.equals("VISUAL") && e1.getFormat().name().contains("DIAGRAM")) return -1;
                if (learningStyle.equals("AUDITORY") && e1.getFormat().name().contains("STEP_BY_STEP")) return -1;
            }
            return 0;
        });

        return explanations;
    }

    @Override
    public ProjectDTO createProject(ProjectRequest projectRequest) {
        // Validate request
        if (projectRequest.getStudentId() == null) {
            throw new RuntimeException("Student ID is required");
        }

        // Convert ProjectRequest to Project entity
        Project project = new Project();
        project.setTitle(projectRequest.getTitle());
        project.setDescription(projectRequest.getDescription());
        project.setTechnologiesUsed(projectRequest.getTechnologiesUsed());
        project.setStartDate(projectRequest.getStartDate());
        project.setEndDate(projectRequest.getEndDate());

        // Set default values if not provided
        project.setProgressPercentage(projectRequest.getProgressPercentage() != null ?
                projectRequest.getProgressPercentage() : 0.0);

        project.setProjectStatus(projectRequest.getProjectStatus() != null ?
                projectRequest.getProjectStatus() : "NOT_STARTED");

        project.setGithubUrl(projectRequest.getGithubUrl());
        project.setDocumentationUrl(projectRequest.getDocumentationUrl());

        // Set student
        Student student = studentRepository.findById(projectRequest.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + projectRequest.getStudentId()));
        project.setStudent(student);

        Project savedProject = projectRepository.save(project);
        return new ProjectDTO(savedProject); // Use the constructor
    }

    @Override
    public StudentResponse submitAssessmentResponse(StudentResponse response) {
        response.setSubmittedAt(LocalDateTime.now());

        // Calculate if response is correct (simplified)
        Question question = response.getQuestion();
        if (question.getCorrectAnswer() != null) {
            response.setIsCorrect(question.getCorrectAnswer().equals(response.getAnswer()));
            response.setPointsObtained(response.getIsCorrect() ? question.getPoints().doubleValue() : 0.0);
        }

        return studentResponseRepository.save(response);
    }

//    @Override
//    public DashboardResponse getStudentDashboard(Long studentId) {
//        Student student = studentRepository.findById(studentId)
//                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
//
//        List<Project> projects = projectRepository.findByStudentId(studentId);
//        List<StudentResponse> recentResponses = studentResponseRepository.findByStudentId(studentId)
//                .stream()
//                .limit(10)
//                .toList();
//
//        Long totalProjects = (long) projects.size();
//        Long completedProjects = projects.stream()
//                .filter(p -> "COMPLETED".equals(p.getProjectStatus()))
//                .count();
//
//        Double averagePerformance = studentResponseRepository.findAverageScoreByAssessmentId(studentId);
//
//        return new DashboardResponse(totalProjects, completedProjects, averagePerformance, projects, recentResponses);
//    }


    public StudentDTO getStudentDashboard(Long studentId) {
        // Fetch student with necessary relationships
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        // Fetch additional data if not already loaded
        List<Project> projects = projectRepository.findByStudentId(studentId);
        List<StudentResponse> responses = studentResponseRepository.findByStudentIdWithAssessment(studentId);

        // Convert to DTO
        StudentDTO studentDTO = new StudentDTO(student);

        // Set the fetched data (if not already set in constructor)
        if (studentDTO.getProjects() == null) {
            List<ProjectDTO> projectDTOs = projects.stream()
                    .map(ProjectDTO::new)
                    .collect(Collectors.toList());
            studentDTO.setProjects(projectDTOs);
        }

        if (studentDTO.getResponses() == null) {
            List<StudentResponseDTO> responseDTOs = responses.stream()
                    .map(StudentResponseDTO::new)
                    .collect(Collectors.toList());
            studentDTO.setResponses(responseDTOs);
        }

        return studentDTO;
    }



    @Override
    public List<Project> getStudentProjects(Long studentId) {
        System.out.println("Fetching projects for studentId = " + studentId);
        List<Project> projects = projectRepository.findByStudentId(studentId);
        System.out.println(projects);
        return projects;
    }



    @Override
    public Explanation getPersonalizedExplanation(Long topicId, Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        // Get explanations and return the one that best matches student's learning style
        List<Explanation> explanations = explanationRepository.findByTopicId(topicId);

        if (explanations.isEmpty()) {
            throw new RuntimeException("No explanations found for topic id: " + topicId);
        }

        // Simple algorithm to pick the best explanation format
        ExplanationFormat preferredFormat = getPreferredFormat(student.getLearningStyle());

        return explanations.stream()
                .filter(e -> e.getFormat() == preferredFormat)
                .findFirst()
                .orElse(explanations.get(0)); // Fallback to first explanation
    }

    // Use the new method in your service
    public List<StudentResponseDTO> getStudentResponseDTOs(Long studentId) {
        // Use the new method that fetches assessment data
        List<StudentResponse> responses = studentResponseRepository.findByStudentIdWithAssessment(studentId);
        return responses.stream()
                .map(StudentResponseDTO::new)
                .collect(Collectors.toList());
    }

    // Keep the old method if you still need it
    public List<StudentResponse> getStudentResponses(Long studentId) {
        return studentResponseRepository.findByStudentId(studentId);
    }

    @Override
    public ProjectDTO updateProjectProgress(Long projectId, Double progress, Long studentId) {
        // First, verify the project belongs to the student
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        // Verify ownership
        if (!project.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("Project does not belong to the student");
        }

        // Update progress
        project.setProgressPercentage(progress);
        if (progress >= 100.0) {
            project.setProjectStatus("COMPLETED");
        } else if (progress > 0) {
            project.setProjectStatus("IN_PROGRESS");
        } else {
            project.setProjectStatus("NOT_STARTED");
        }

        Project updatedProject = projectRepository.save(project);
        return new ProjectDTO(updatedProject); // Use the constructor
    }

    private ExplanationFormat getPreferredFormat(String learningStyle) {
        if (learningStyle == null) return ExplanationFormat.STEP_BY_STEP;

        return switch (learningStyle.toUpperCase()) {
            case "VISUAL" -> ExplanationFormat.DIAGRAM;
            case "AUDITORY" -> ExplanationFormat.STEP_BY_STEP;
            case "KINESTHETIC" -> ExplanationFormat.CODE_EXAMPLE;
            case "READ_WRITE" -> ExplanationFormat.REAL_WORLD_EXAMPLE;
            default -> ExplanationFormat.STEP_BY_STEP;
        };
    }



    private ProjectDTO convertToProjectDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setTitle(project.getTitle());
        dto.setDescription(project.getDescription());
        dto.setTechnologiesUsed(project.getTechnologiesUsed());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setProjectStatus(project.getProjectStatus());
        dto.setProgressPercentage(project.getProgressPercentage());
        dto.setGithubUrl(project.getGithubUrl());
        dto.setDocumentationUrl(project.getDocumentationUrl());

        // Set student information if needed
        if (project.getStudent() != null) {
            dto.setStudentId(project.getStudent().getId());
            dto.setStudentName(project.getStudent().getFirstName() + " " + project.getStudent().getLastName());
        }

        return dto;
    }

    @Override
    public List<ProjectDTO> getStudentProjectDTOs(Long studentId) {
        List<Project> projects = projectRepository.findByStudentId(studentId);
        return projects.stream()
                .map(ProjectDTO::new) // Use constructor reference
                .collect(Collectors.toList());
    }
}