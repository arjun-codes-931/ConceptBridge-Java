package com.conceptbridge.repository;

import com.conceptbridge.entity.ComprehensionMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComprehensionMetricsRepository extends JpaRepository<ComprehensionMetrics, Long> {
//    @Query("SELECT cm FROM ComprehensionMetrics cm WHERE cm.student.id = :studentId AND cm.topic.id = :topicId")
//    Optional<ComprehensionMetrics> findByStudentIdAndTopicId(@Param("studentId") Long studentId, @Param("topicId") Long topicId);
//
//    @Query("SELECT cm FROM ComprehensionMetrics cm WHERE cm.student.id = :studentId")
//    List<ComprehensionMetrics> findByStudentId(@Param("studentId") Long studentId);
//
//    @Query("SELECT cm FROM ComprehensionMetrics cm WHERE cm.topic.id = :topicId")
//    List<ComprehensionMetrics> findByTopicId(@Param("topicId") Long topicId);
//
//    @Query("SELECT cm FROM ComprehensionMetrics cm WHERE cm.comprehensionScore < :threshold AND cm.needsIntervention = true")
//    List<ComprehensionMetrics> findStudentsNeedingIntervention(@Param("threshold") Double threshold);

    @Query("SELECT AVG(cm.comprehensionScore) FROM ComprehensionMetrics cm WHERE cm.topic.id = :topicId")
    Double findAverageComprehensionByTopicId(@Param("topicId") Long topicId);
}