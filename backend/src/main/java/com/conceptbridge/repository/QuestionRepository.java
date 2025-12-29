package com.conceptbridge.repository;

import com.conceptbridge.entity.Question;
import com.conceptbridge.entity.QuestionType;
import com.conceptbridge.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    // For Assessment Questions
//    @Query("SELECT q FROM Question q WHERE q.assessment.id = :assessmentId ORDER BY q.questionOrder")
//    List<Question> findByAssessmentIdOrderByQuestionOrder(@Param("assessmentId") Long assessmentId);

//    @Query("SELECT q FROM Question q WHERE q.type = :type")
//    List<Question> findByType(@Param("type") QuestionType type);
//
//    @Query("SELECT COUNT(q) FROM Question q WHERE q.assessment.id = :assessmentId")
//    Long countByAssessmentId(@Param("assessmentId") Long assessmentId);
//
//    // For Quiz Questions - You need a separate query
//    @Query("SELECT qq FROM QuizQuestion qq WHERE qq.quiz.id = :quizId")
//    List<QuizQuestion> findQuizQuestionsByQuizId(@Param("quizId") Long quizId);

}