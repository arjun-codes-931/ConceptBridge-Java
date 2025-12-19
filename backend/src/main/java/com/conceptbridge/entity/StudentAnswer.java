// StudentAnswer.java
package com.conceptbridge.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "student_answers")
public class StudentAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "attempt_id", nullable = false)
    private StudentQuizAttempt attempt;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestion question;

    private String selectedAnswer;
    private Boolean isCorrect;
    private Integer pointsObtained;

    private LocalDateTime answeredAt;
    private Integer timeTaken; // in seconds for this question

    public StudentAnswer(Long id, StudentQuizAttempt attempt, QuizQuestion question, String selectedAnswer, Boolean isCorrect, Integer pointsObtained, LocalDateTime answeredAt, Integer timeTaken) {
        this.id = id;
        this.attempt = attempt;
        this.question = question;
        this.selectedAnswer = selectedAnswer;
        this.isCorrect = isCorrect;
        this.pointsObtained = pointsObtained;
        this.answeredAt = answeredAt;
        this.timeTaken = timeTaken;
    }

    public StudentAnswer() {

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public StudentQuizAttempt getAttempt() {
        return attempt;
    }

    public void setAttempt(StudentQuizAttempt attempt) {
        this.attempt = attempt;
    }

    public QuizQuestion getQuestion() {
        return question;
    }

    public void setQuestion(QuizQuestion question) {
        this.question = question;
    }

    public String getSelectedAnswer() {
        return selectedAnswer;
    }

    public void setSelectedAnswer(String selectedAnswer) {
        this.selectedAnswer = selectedAnswer;
    }

    public Boolean getCorrect() {
        return isCorrect;
    }

    public void setCorrect(Boolean correct) {
        isCorrect = correct;
    }

    public Integer getPointsObtained() {
        return pointsObtained;
    }

    public void setPointsObtained(Integer pointsObtained) {
        this.pointsObtained = pointsObtained;
    }

    public LocalDateTime getAnsweredAt() {
        return answeredAt;
    }

    public void setAnsweredAt(LocalDateTime answeredAt) {
        this.answeredAt = answeredAt;
    }

    public Integer getTimeTaken() {
        return timeTaken;
    }

    public void setTimeTaken(Integer timeTaken) {
        this.timeTaken = timeTaken;
    }
}