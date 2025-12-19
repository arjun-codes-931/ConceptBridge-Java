// QuizRepository.java
package com.conceptbridge.repository;

import com.conceptbridge.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    @Query("SELECT q FROM Quiz q WHERE q.status = 'ACTIVE'")
    List<Quiz> findActiveQuizzes();

    List<Quiz> findByTeacherId(Long teacherId);

    List<Quiz> findByTopicId(Long topicId);
}



