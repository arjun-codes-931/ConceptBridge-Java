package com.conceptbridge.repository;

import com.conceptbridge.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {

    List<QuizQuestion> findByQuizId(Long quizId);

//    List<QuizQuestion> findByQuizIdOrderByQuestionOrder(Long quizId);

//    @Query("SELECT COUNT(q) FROM QuizQuestion q WHERE q.quiz.id = :quizId")
//    Long countByQuizId(@Param("quizId") Long quizId);
}