package com.conceptbridge.repository;

import com.conceptbridge.entity.Assessment;
import com.conceptbridge.entity.AssessmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {

    List<Assessment> findByTeacherIdAndTypeAndIsActiveTrue(
            Long teacherId,
            AssessmentType type
    );

    @Query("SELECT a FROM Assessment a WHERE a.teacher.id = :teacherId")
    List<Assessment> findByTeacherId(@Param("teacherId") Long teacherId);

//    @Query("SELECT a FROM Assessment a WHERE a.topic.id = :topicId")
//    List<Assessment> findByTopicId(@Param("topicId") Long topicId);
//
//    @Query("SELECT a FROM Assessment a WHERE a.type = :type")
//    List<Assessment> findByType(@Param("type") AssessmentType type);
//
//    @Query("SELECT a FROM Assessment a WHERE a.isActive = true AND a.dueDate > :currentDate")
//    List<Assessment> findActiveAssessmentsWithFutureDueDate(@Param("currentDate") LocalDateTime currentDate);
//
//    @Query("SELECT a FROM Assessment a WHERE a.createdAt BETWEEN :startDate AND :endDate")
//    List<Assessment> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    Optional<Assessment> findByIdAndIsActiveTrue(Long id);}