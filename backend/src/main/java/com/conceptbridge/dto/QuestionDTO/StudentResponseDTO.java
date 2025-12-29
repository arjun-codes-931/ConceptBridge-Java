package com.conceptbridge.dto.QuestionDTO;

import com.conceptbridge.entity.StudentResponse;

import java.time.OffsetDateTime;

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
    private OffsetDateTime submittedAt;
    private OffsetDateTime  startedAt;
    private Integer timeTaken;
    private String feedback;

    public StudentResponseDTO() {
    }

    public StudentResponseDTO(Long id, Long studentId, Long assessmentId, String assessmentTitle, Long questionId, String answer, Boolean isCorrect, Double pointsObtained, Integer attemptNumber, OffsetDateTime submittedAt, OffsetDateTime startedAt, Integer timeTaken, String feedback) {
        this.id = id;
        this.studentId = studentId;
        this.assessmentId = assessmentId;
        this.assessmentTitle = assessmentTitle;
        this.questionId = questionId;
        this.answer = answer;
        this.isCorrect = isCorrect;
        this.pointsObtained = pointsObtained;
        this.attemptNumber = attemptNumber;
        this.submittedAt = submittedAt;
        this.startedAt = startedAt;
        this.timeTaken = timeTaken;
        this.feedback = feedback;
    }

    public StudentResponseDTO(StudentResponse studentResponse) {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public String getAssessmentTitle() {
        return assessmentTitle;
    }

    public void setAssessmentTitle(String assessmentTitle) {
        this.assessmentTitle = assessmentTitle;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public Boolean getCorrect() {
        return isCorrect;
    }

    public void setCorrect(Boolean correct) {
        isCorrect = correct;
    }

    public Double getPointsObtained() {
        return pointsObtained;
    }

    public void setPointsObtained(Double pointsObtained) {
        this.pointsObtained = pointsObtained;
    }

    public Integer getAttemptNumber() {
        return attemptNumber;
    }

    public void setAttemptNumber(Integer attemptNumber) {
        this.attemptNumber = attemptNumber;
    }

    public OffsetDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(OffsetDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public OffsetDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(OffsetDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public Integer getTimeTaken() {
        return timeTaken;
    }

    public void setTimeTaken(Integer timeTaken) {
        this.timeTaken = timeTaken;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}