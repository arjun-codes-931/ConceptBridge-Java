package com.conceptbridge.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "comprehension_metrics")
public class ComprehensionMetrics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    private Double comprehensionScore;
    private Integer totalAttempts;
    private Integer correctAttempts;
    private Double averageTimePerQuestion;
    private String difficultyLevel;

    @ElementCollection
    @CollectionTable(name = "learning_style_metrics", joinColumns = @JoinColumn(name = "metrics_id"))
    @MapKeyColumn(name = "explanation_format")
    @Column(name = "effectiveness_score")
    private Map<String, Double> formatEffectiveness = new HashMap<>();

    private LocalDateTime lastUpdated;
    private String recommendations;
    private Boolean needsIntervention;

    // Getters and Setters...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public Topic getTopic() { return topic; }
    public void setTopic(Topic topic) { this.topic = topic; }
    public Double getComprehensionScore() { return comprehensionScore; }
    public void setComprehensionScore(Double comprehensionScore) { this.comprehensionScore = comprehensionScore; }
    public Integer getTotalAttempts() { return totalAttempts; }
    public void setTotalAttempts(Integer totalAttempts) { this.totalAttempts = totalAttempts; }
    public Integer getCorrectAttempts() { return correctAttempts; }
    public void setCorrectAttempts(Integer correctAttempts) { this.correctAttempts = correctAttempts; }
    public Double getAverageTimePerQuestion() { return averageTimePerQuestion; }
    public void setAverageTimePerQuestion(Double averageTimePerQuestion) { this.averageTimePerQuestion = averageTimePerQuestion; }
    public String getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }
    public Map<String, Double> getFormatEffectiveness() { return formatEffectiveness; }
    public void setFormatEffectiveness(Map<String, Double> formatEffectiveness) { this.formatEffectiveness = formatEffectiveness; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }
    public Boolean getNeedsIntervention() { return needsIntervention; }
    public void setNeedsIntervention(Boolean needsIntervention) { this.needsIntervention = needsIntervention; }
}