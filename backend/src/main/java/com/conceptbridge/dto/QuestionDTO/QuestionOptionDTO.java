package com.conceptbridge.dto.QuestionDTO;

public class QuestionOptionDTO {
    private Long id;
    private String optionText;
    private Boolean isCorrect;
    private Integer optionOrder;

    public QuestionOptionDTO() {
    }

    public QuestionOptionDTO(Long id, String optionText, Boolean isCorrect, Integer optionOrder) {
        this.id = id;
        this.optionText = optionText;
        this.isCorrect = isCorrect;
        this.optionOrder = optionOrder;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOptionText() {
        return optionText;
    }

    public void setOptionText(String optionText) {
        this.optionText = optionText;
    }

    public Boolean getCorrect() {
        return isCorrect;
    }

    public void setCorrect(Boolean correct) {
        isCorrect = correct;
    }

    public Integer getOptionOrder() {
        return optionOrder;
    }

    public void setOptionOrder(Integer optionOrder) {
        this.optionOrder = optionOrder;
    }
}
