package com.conceptbridge.dto.QuestionDTO;

import com.conceptbridge.entity.Question;
import com.conceptbridge.entity.QuestionType;

import java.util.List;

public class StudentQuestionDTO {
    private Long id;
    private String questionText;
    private QuestionType type;
    private Long assessmentId;
    private List<String> options;
    private String codeSnippet;
    private Integer points;
    private Integer questionOrder;

    public StudentQuestionDTO() {
    }

    public StudentQuestionDTO(Question question) {
        this.id = question.getId();
        this.questionText = question.getQuestionText();
        this.type = question.getType();
        this.assessmentId = question.getAssessment().getId();
        this.options = question.getOptions();
        this.codeSnippet = question.getCodeSnippet();
        this.points = question.getPoints();
        this.questionOrder = question.getQuestionOrder();
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

    public QuestionType getType() {
        return type;
    }

    public void setType(QuestionType type) {
        this.type = type;
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public String getCodeSnippet() {
        return codeSnippet;
    }

    public void setCodeSnippet(String codeSnippet) {
        this.codeSnippet = codeSnippet;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public Integer getQuestionOrder() {
        return questionOrder;
    }

    public void setQuestionOrder(Integer questionOrder) {
        this.questionOrder = questionOrder;
    }
}
