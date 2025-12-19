package com.conceptbridge.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;


public class QuizDTO {
    private Long id;
    private String title;
    private String description;
    private Long teacherId;
    private String teacherName;
    private Long topicId;
    private String topicName;
    private String status;
    private Integer duration;
    private Integer totalQuestions;
    private Integer passingScore;
    private List<QuizQuestionDTO> questions;
    private LocalDateTime createdAt;

    public QuizDTO(Long id, String title, String description, Long teacherId, String teacherName, Long topicId, String topicName, String status, Integer duration, Integer totalQuestions, Integer passingScore, List<QuizQuestionDTO> questions, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.teacherId = teacherId;
        this.teacherName = teacherName;
        this.topicId = topicId;
        this.topicName = topicName;
        this.status = status;
        this.duration = duration;
        this.totalQuestions = totalQuestions;
        this.passingScore = passingScore;
        this.questions = questions;
        this.createdAt = createdAt;
    }

    public QuizDTO() {

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public Long getTopicId() {
        return topicId;
    }

    public void setTopicId(Long topicId) {
        this.topicId = topicId;
    }

    public String getTopicName() {
        return topicName;
    }

    public void setTopicName(String topicName) {
        this.topicName = topicName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Integer getPassingScore() {
        return passingScore;
    }

    public void setPassingScore(Integer passingScore) {
        this.passingScore = passingScore;
    }

    public List<QuizQuestionDTO> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuizQuestionDTO> questions) {
        this.questions = questions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}