package com.conceptbridge.dto.QuestionDTO;

import lombok.Data;
import java.util.List;

@Data
public class QuizQuestionDTO {
    private Long id;
    private String questionText;
    private String questionType;
    private Integer points;
    private String correctAnswer; // Only include when appropriate
    private List<QuestionOptionDTO> options;

    public QuizQuestionDTO() {
    }

    public QuizQuestionDTO(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public List<QuestionOptionDTO> getOptions() {
        return options;
    }

    public void setOptions(List<QuestionOptionDTO> options) {
        this.options = options;
    }
}