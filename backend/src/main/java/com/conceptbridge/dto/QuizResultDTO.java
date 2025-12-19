package com.conceptbridge.dto; // Put in the common DTO package

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class QuizResultDTO {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private Integer scorePercentage;
    private Boolean passed;
    private Integer passingScore;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private Integer totalPoints;
    private String grade; // A, B, C, etc.
    private LocalDateTime completedAt;
    private List<QuestionResultDTO> questionResults;

    public QuizResultDTO() {
    }

    public QuizResultDTO(Long attemptId, Long quizId, String quizTitle, Integer scorePercentage, Boolean passed, Integer passingScore, Integer correctAnswers, Integer totalQuestions, Integer totalPoints, String grade, LocalDateTime completedAt, List<QuestionResultDTO> questionResults) {
        this.attemptId = attemptId;
        this.quizId = quizId;
        this.quizTitle = quizTitle;
        this.scorePercentage = scorePercentage;
        this.passed = passed;
        this.passingScore = passingScore;
        this.correctAnswers = correctAnswers;
        this.totalQuestions = totalQuestions;
        this.totalPoints = totalPoints;
        this.grade = grade;
        this.completedAt = completedAt;
        this.questionResults = questionResults;
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }

    public Integer getScorePercentage() {
        return scorePercentage;
    }

    public void setScorePercentage(Integer scorePercentage) {
        this.scorePercentage = scorePercentage;
    }

    public Boolean getPassed() {
        return passed;
    }

    public void setPassed(Boolean passed) {
        this.passed = passed;
    }

    public Integer getPassingScore() {
        return passingScore;
    }

    public void setPassingScore(Integer passingScore) {
        this.passingScore = passingScore;
    }

    public Integer getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(Integer correctAnswers) {
        this.correctAnswers = correctAnswers;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Integer getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(Integer totalPoints) {
        this.totalPoints = totalPoints;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public List<QuestionResultDTO> getQuestionResults() {
        return questionResults;
    }

    public void setQuestionResults(List<QuestionResultDTO> questionResults) {
        this.questionResults = questionResults;
    }
}