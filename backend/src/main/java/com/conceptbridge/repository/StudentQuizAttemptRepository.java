// StudentQuizAttemptRepository.java
package com.conceptbridge.repository;

import com.conceptbridge.entity.StudentQuizAttempt;
import com.conceptbridge.entity.User;
import com.conceptbridge.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentQuizAttemptRepository extends JpaRepository<StudentQuizAttempt, Long> {

    StudentQuizAttempt findByStudentAndQuizAndStatus(User student, Quiz quiz,
                                                     StudentQuizAttempt.AttemptStatus status);

    List<StudentQuizAttempt> findByStudentOrderByCompletedAtDesc(User student);

//    List<StudentQuizAttempt> findByQuizId(Long quizId);
}