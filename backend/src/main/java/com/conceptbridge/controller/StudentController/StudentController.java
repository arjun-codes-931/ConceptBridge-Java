package com.conceptbridge.controller.StudentController;

import com.conceptbridge.dto.QuestionDTO.StudentQuizDTO;
import com.conceptbridge.dto.QuestionDTO.StudentResponseDTO;
import com.conceptbridge.dto.request.ProjectRequest;
import com.conceptbridge.dto.studentDTO.ProjectDTO;
import com.conceptbridge.dto.studentDTO.StudentDTO;
import com.conceptbridge.entity.Explanation;
import com.conceptbridge.entity.Project;
import com.conceptbridge.entity.Student;
import com.conceptbridge.entity.StudentResponse;
import com.conceptbridge.repository.ProjectRepository;
import com.conceptbridge.repository.StudentRepository;
import com.conceptbridge.service.StudentQuizService;
import com.conceptbridge.service.StudentService;
import com.conceptbridge.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private StudentRepository studentRepository;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @Autowired
    ProjectRepository projectRepository;
    @Autowired
    StudentQuizService studentQuizService;

    @GetMapping("/topics/{topicId}/explanations")
    public ResponseEntity<List<Explanation>> getTopicExplanations(@PathVariable Long topicId,
                                                                  Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<Explanation> explanations = studentService.getExplanationsForTopic(topicId, userPrincipal.getId());
        return ResponseEntity.ok(explanations);
    }

//    @GetMapping("/quiz/{assessmentId}/questions")
//    public List<StudentQuestionDTO> getQuestionsForStudent(
//            @PathVariable Long assessmentId,
//            @AuthenticationPrincipal UserDetails userDetails
//    ) {
//        return studentQuizService.getQuestionsForStudent(
//                assessmentId,
//                userDetails.getUsername()
//        );
//    }


    @GetMapping("/explanations/{topicId}/personalized")
    public ResponseEntity<Explanation> getPersonalizedExplanation(@PathVariable Long topicId,
                                                                  Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Explanation explanation = studentService.getPersonalizedExplanation(topicId, userPrincipal.getId());
        return ResponseEntity.ok(explanation);
    }

    @PostMapping("/projects")
    public ResponseEntity<ProjectDTO> createProject(@RequestBody ProjectRequest projectRequest,
                                                    Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        projectRequest.setStudentId(userPrincipal.getId());
        ProjectDTO projectDTO = studentService.createProject(projectRequest);
        return ResponseEntity.ok(projectDTO);
    }

    @PostMapping("/assessments/{assessmentId}/responses")
    public ResponseEntity<StudentResponse> submitResponse(@PathVariable Long assessmentId,
                                                          @RequestBody StudentResponse response,
                                                          Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        response.getStudent().setId(userPrincipal.getId());
        StudentResponse savedResponse = studentService.submitAssessmentResponse(response);
        return ResponseEntity.ok(savedResponse);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<StudentDTO> getStudentDashboard(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        StudentDTO studentDTO = studentService.getStudentDashboard(userPrincipal.getId());
        System.out.println("Fetching dashboard for student ID: " + userPrincipal.getId());
        return ResponseEntity.ok(studentDTO);
    }

    @GetMapping("/projects")
    public ResponseEntity<List<ProjectDTO>> getStudentProjects(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        // Use the DTO method from service
        List<ProjectDTO> projectDTOs = studentService.getStudentProjectDTOs(userPrincipal.getId());

        System.out.println(userPrincipal.getId());
        System.out.println(projectDTOs);

        return ResponseEntity.ok(projectDTOs);
    }


    @PutMapping("/projects/{projectId}/progress")
    public ResponseEntity<ProjectDTO> updateProjectProgress(@PathVariable Long projectId,
                                                            @RequestParam Double progress,
                                                            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        ProjectDTO projectDTO = studentService.updateProjectProgress(projectId, progress, userPrincipal.getId());
        return ResponseEntity.ok(projectDTO);
    }

    @GetMapping("/responses")
    public ResponseEntity<List<StudentResponseDTO>> getStudentResponses(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<StudentResponseDTO> responseDTOs = studentService.getStudentResponseDTOs(userPrincipal.getId());
        return ResponseEntity.ok(responseDTOs);
    }

    // Add this method to StudentController
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

        // Set student information if available
        if (project.getStudent() != null) {
            dto.setStudentId(project.getStudent().getId());
            dto.setStudentName(project.getStudent().getFirstName() + " " + project.getStudent().getLastName());
        }

        return dto;
    }

//    @GetMapping("/quizzes")
//    public List<StudentQuizDTO> getQuizzes(Authentication auth) {
//        return studentQuizService.getAvailableQuizzes(auth.getName());
//    }

//    @PostMapping("/quiz/{assessmentId}/answer")
//    public AnswerResultDTO submitAnswer(
//            @PathVariable Long assessmentId,
//            @RequestBody AnswerSubmitDTO dto,
//            Authentication auth
//    ) {
//        return studentQuizService.submitAnswer(
//                auth.getName(),
//                assessmentId,
//                dto
//        );
//    }

//    @GetMapping("/quizzes/test")
//    public ResponseEntity<String> testQuizzesEndpoint(Authentication authentication) {
//        return ResponseEntity.ok("Quizzes endpoint is working! User: " + authentication.getName());
//    }

    @GetMapping("/quizzes/debug")
    public ResponseEntity<?> debugQuizzes(Authentication auth) {
        try {
            System.out.println("DEBUG: Getting quizzes for user: " + auth.getName());

            Student student = studentRepository.findByUsername(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            System.out.println("DEBUG: Student found: " + student.getId());
            System.out.println("DEBUG: Teacher: " + (student.getTeacher() != null ?
                    student.getTeacher().getId() : "NO TEACHER"));

            List<StudentQuizDTO> quizzes = studentQuizService.getAvailableQuizzes(auth.getName());

            System.out.println("DEBUG: Quizzes found: " + quizzes.size());

            return ResponseEntity.ok(Map.of(
                    "user", auth.getName(),
                    "studentId", student.getId(),
                    "hasTeacher", student.getTeacher() != null,
                    "teacherId", student.getTeacher() != null ? student.getTeacher().getId() : null,
                    "quizzes", quizzes
            ));

        } catch (Exception e) {
            System.out.println("DEBUG ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage(), "stackTrace", e.getStackTrace()));
        }
    }
}