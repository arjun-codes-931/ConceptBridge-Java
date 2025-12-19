package com.conceptbridge.dto;

import com.conceptbridge.entity.StudentResponse;

import java.time.LocalDateTime;

public class StudentResponseDTO {
    private Long id;
    private Long studentId;
    private Long assessmentId;
    private String assessmentTitle;  // This will now be populated
    private Long questionId;
    private String answer;
    private Boolean isCorrect;
    private Double pointsObtained;
    private Integer attemptNumber;
    private LocalDateTime submittedAt;
    private LocalDateTime startedAt;
    private Integer timeTaken;
    private String feedback;

    public StudentResponseDTO() {
    }

    // Constructor from Entity
    public StudentResponseDTO(StudentResponse studentResponse) {
        this.id = studentResponse.getId();
        this.studentId = studentResponse.getStudent() != null ? studentResponse.getStudent().getId() : null;
        this.assessmentId = studentResponse.getAssessment() != null ? studentResponse.getAssessment().getId() : null;

        // This will now work because we're fetching assessment data
        this.assessmentTitle = studentResponse.getAssessment() != null ?
                studentResponse.getAssessment().getTitle() : null;

        this.questionId = studentResponse.getQuestion() != null ? studentResponse.getQuestion().getId() : null;
        this.answer = studentResponse.getAnswer();
        this.isCorrect = studentResponse.getIsCorrect();
        this.pointsObtained = studentResponse.getPointsObtained();
        this.attemptNumber = studentResponse.getAttemptNumber();
        this.submittedAt = studentResponse.getSubmittedAt();
        this.startedAt = studentResponse.getStartedAt();
        this.timeTaken = studentResponse.getTimeTaken();
        this.feedback = studentResponse.getFeedback();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }
    public String getAssessmentTitle() { return assessmentTitle; }
    public void setAssessmentTitle(String assessmentTitle) { this.assessmentTitle = assessmentTitle; }
    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public Boolean getIsCorrect() { return isCorrect; }
    public void setIsCorrect(Boolean isCorrect) { this.isCorrect = isCorrect; }
    public Double getPointsObtained() { return pointsObtained; }
    public void setPointsObtained(Double pointsObtained) { this.pointsObtained = pointsObtained; }
    public Integer getAttemptNumber() { return attemptNumber; }
    public void setAttemptNumber(Integer attemptNumber) { this.attemptNumber = attemptNumber; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public Integer getTimeTaken() { return timeTaken; }
    public void setTimeTaken(Integer timeTaken) { this.timeTaken = timeTaken; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
}