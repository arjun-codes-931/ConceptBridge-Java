package com.conceptbridge.repository;

import com.conceptbridge.entity.Explanation;
import com.conceptbridge.entity.ExplanationFormat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExplanationRepository extends JpaRepository<Explanation, Long> {
    @Query("SELECT e FROM Explanation e WHERE e.topic.id = :topicId")
    List<Explanation> findByTopicId(@Param("topicId") Long topicId);

    @Query("SELECT e FROM Explanation e WHERE e.topic.id = :topicId AND e.format = :format")
    List<Explanation> findByTopicIdAndFormat(@Param("topicId") Long topicId, @Param("format") ExplanationFormat format);

    @Query("SELECT COUNT(e) FROM Explanation e WHERE e.topic.teacher.id = :teacherId")
    Long countByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT e FROM Explanation e WHERE e.rating >= :minRating")
    List<Explanation> findByRatingGreaterThanEqual(@Param("minRating") Integer minRating);

    @Query("SELECT e FROM Explanation e WHERE e.aiModelUsed = :aiModel")
    List<Explanation> findByAiModelUsed(@Param("aiModel") String aiModel);
}