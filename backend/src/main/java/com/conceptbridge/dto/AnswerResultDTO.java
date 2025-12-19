package com.conceptbridge.dto; // Put in the common DTO package

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AnswerResultDTO {
    private Long questionId;
    private boolean isCorrect;
    private Integer pointsObtained;
    private String correctAnswer;
    private String explanation;
    private String feedback;
    private LocalDateTime answeredAt;

    public AnswerResultDTO() {
    }

    public AnswerResultDTO(Long questionId, boolean isCorrect, Integer pointsObtained, String correctAnswer, String explanation, String feedback, LocalDateTime answeredAt) {
        this.questionId = questionId;
        this.isCorrect = isCorrect;
        this.pointsObtained = pointsObtained;
        this.correctAnswer = correctAnswer;
        this.explanation = explanation;
        this.feedback = feedback;
        this.answeredAt = answeredAt;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public boolean isCorrect() {
        return isCorrect;
    }

    public void setCorrect(boolean correct) {
        isCorrect = correct;
    }

    public Integer getPointsObtained() {
        return pointsObtained;
    }

    public void setPointsObtained(Integer pointsObtained) {
        this.pointsObtained = pointsObtained;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public LocalDateTime getAnsweredAt() {
        return answeredAt;
    }

    public void setAnsweredAt(LocalDateTime answeredAt) {
        this.answeredAt = answeredAt;
    }
}