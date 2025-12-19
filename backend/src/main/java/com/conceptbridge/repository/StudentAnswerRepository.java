// StudentAnswerRepository.java
package com.conceptbridge.repository;

import com.conceptbridge.entity.StudentAnswer;
import com.conceptbridge.entity.StudentQuizAttempt;
import com.conceptbridge.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {

    List<StudentAnswer> findByAttempt(StudentQuizAttempt attempt);

    StudentAnswer findByAttemptAndQuestion(StudentQuizAttempt attempt, QuizQuestion question);
}