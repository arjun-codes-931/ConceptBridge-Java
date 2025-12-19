package com.conceptbridge.dto;

import com.conceptbridge.entity.Student;

import java.util.List;
import java.util.stream.Collectors;

public class StudentDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String username;
    private String enrollmentNumber;
    private String semester;
    private String branch;
    private Double overallPerformance;
    private Long teacherId;
    private String learningStyle;
    private Integer difficultyLevel;
    private List<ProjectDTO> projects;
    private List<StudentResponseDTO> responses;

    // Constructor from Entity
    public StudentDTO(Student student) {
        this.id = student.getId();
        this.firstName = student.getFirstName();
        this.lastName = student.getLastName();
        this.email = student.getEmail();
        this.username = student.getUsername();
        this.enrollmentNumber = student.getEnrollmentNumber();
        this.semester = student.getSemester();
        this.branch = student.getBranch();
        this.overallPerformance = student.getOverallPerformance();
        this.teacherId = student.getTeacher() != null ? student.getTeacher().getId() : null;
        this.learningStyle = student.getLearningStyle();
        this.difficultyLevel = student.getDifficultyLevel();

        // Convert nested entities to DTOs if needed
        if (student.getProjects() != null) {
            this.projects = student.getProjects().stream()
                    .map(ProjectDTO::new)
                    .collect(Collectors.toList());
        }

        if (student.getResponses() != null) {
            this.responses = student.getResponses().stream()
                    .map(StudentResponseDTO::new)
                    .collect(Collectors.toList());
        }
    }

    // Default constructor
    public StudentDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEnrollmentNumber() { return enrollmentNumber; }
    public void setEnrollmentNumber(String enrollmentNumber) { this.enrollmentNumber = enrollmentNumber; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public Double getOverallPerformance() { return overallPerformance; }
    public void setOverallPerformance(Double overallPerformance) { this.overallPerformance = overallPerformance; }
    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }
    public String getLearningStyle() { return learningStyle; }
    public void setLearningStyle(String learningStyle) { this.learningStyle = learningStyle; }
    public Integer getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(Integer difficultyLevel) { this.difficultyLevel = difficultyLevel; }
    public List<ProjectDTO> getProjects() { return projects; }
    public void setProjects(List<ProjectDTO> projects) { this.projects = projects; }
    public List<StudentResponseDTO> getResponses() { return responses; }
    public void setResponses(List<StudentResponseDTO> responses) { this.responses = responses; }
}