package com.conceptbridge.repository;

import com.conceptbridge.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    @Query("SELECT p FROM Project p WHERE p.student.id = :studentId")
    List<Project> findByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT p FROM Project p WHERE p.student.teacher.id = :teacherId")
    List<Project> findByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT p FROM Project p WHERE p.projectStatus = :status")
    List<Project> findByProjectStatus(@Param("status") String status);

    @Query("SELECT p FROM Project p WHERE p.progressPercentage >= :minProgress")
    List<Project> findByProgressPercentageGreaterThanEqual(@Param("minProgress") Double minProgress);

    @Query("SELECT p FROM Project p JOIN p.relatedTopics t WHERE t.id = :topicId")
    List<Project> findByRelatedTopicId(@Param("topicId") Long topicId);
}