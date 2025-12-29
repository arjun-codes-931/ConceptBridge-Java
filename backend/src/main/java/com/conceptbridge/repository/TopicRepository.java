package com.conceptbridge.repository;

import com.conceptbridge.entity.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    @Query("SELECT t FROM Topic t WHERE t.teacher.id = :teacherId")
    List<Topic> findByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT t FROM Topic t WHERE t.title LIKE %:keyword% OR t.description LIKE %:keyword%")
    List<Topic> findByTitleOrDescriptionContaining(@Param("keyword") String keyword);

    Optional<Topic> findById(Long id);

    @Query("SELECT t FROM Topic t WHERE t.category = :category")
    List<Topic> findByCategory(@Param("category") String category);

    @Query("SELECT t FROM Topic t WHERE t.complexityLevel = :complexityLevel")
    List<Topic> findByComplexityLevel(@Param("complexityLevel") Integer complexityLevel);

    @Query("SELECT t FROM Topic t WHERE t.isActive = true")
    List<Topic> findAllActiveTopics();

    // Add these pagination methods:
    Page<Topic> findAllByIsActiveTrue(Pageable pageable);

//    @Query("SELECT t FROM Topic t WHERE (t.title LIKE %:keyword% OR t.description LIKE %:keyword%) AND t.isActive = true")
//    Page<Topic> findByTitleOrDescriptionContainingAndActive(@Param("keyword") String keyword, Pageable pageable);
//
//    Page<Topic> findByCategoryAndIsActiveTrue(String category, Pageable pageable);
}