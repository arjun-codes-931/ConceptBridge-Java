package com.conceptbridge.dto.studentDTO; // Put in controller package or a common DTO package

import lombok.Data;

@Data
public class SubmitAnswerDTO {
    private Long questionId;
    private String selectedAnswer;

    public SubmitAnswerDTO() {
    }

    public SubmitAnswerDTO(Long questionId, String selectedAnswer) {
        this.questionId = questionId;
        this.selectedAnswer = selectedAnswer;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getSelectedAnswer() {
        return selectedAnswer;
    }

    public void setSelectedAnswer(String selectedAnswer) {
        this.selectedAnswer = selectedAnswer;
    }
}