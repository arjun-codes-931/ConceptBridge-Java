package com.conceptbridge.repository;

import com.conceptbridge.entity.StudentResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface StudentResponseRepository extends JpaRepository<StudentResponse, Long> {

    // Existing methods
    @Query("SELECT sr FROM StudentResponse sr WHERE sr.student.id = :studentId")
    List<StudentResponse> findByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT sr FROM StudentResponse sr WHERE sr.assessment.id = :assessmentId")
    List<StudentResponse> findByAssessmentId(@Param("assessmentId") Long assessmentId);

    @Query("SELECT sr FROM StudentResponse sr WHERE sr.question.id = :questionId")
    List<StudentResponse> findByQuestionId(@Param("questionId") Long questionId);

    @Query("SELECT sr FROM StudentResponse sr WHERE sr.student.id = :studentId AND sr.assessment.id = :assessmentId")
    List<StudentResponse> findByStudentIdAndAssessmentId(@Param("studentId") Long studentId, @Param("assessmentId") Long assessmentId);

    @Query("SELECT COUNT(sr) FROM StudentResponse sr WHERE sr.assessment.id = :assessmentId AND sr.isCorrect = true")
    Long countCorrectResponsesByAssessmentId(@Param("assessmentId") Long assessmentId);

    @Query("SELECT AVG(sr.pointsObtained) FROM StudentResponse sr WHERE sr.assessment.id = :assessmentId")
    Double findAverageScoreByAssessmentId(@Param("assessmentId") Long assessmentId);

    // NEW METHOD: Fetch responses with assessment data
    @Query("SELECT sr FROM StudentResponse sr " +
            "LEFT JOIN FETCH sr.assessment " +
            "WHERE sr.student.id = :studentId")
    List<StudentResponse> findByStudentIdWithAssessment(@Param("studentId") Long studentId);

    // OPTIONAL: Fetch with both assessment and question data
    @Query("SELECT sr FROM StudentResponse sr " +
            "LEFT JOIN FETCH sr.assessment " +
            "LEFT JOIN FETCH sr.question " +
            "WHERE sr.student.id = :studentId")
    List<StudentResponse> findByStudentIdWithDetails(@Param("studentId") Long studentId);

    @Query("""
        SELECT sr.question.id
        FROM StudentResponse sr
        WHERE sr.student.id = :studentId
          AND sr.assessment.id = :assessmentId
    """)
    Set<Long> findAnsweredQuestionIds(
            @Param("studentId") Long studentId,
            @Param("assessmentId") Long assessmentId
    );

    boolean existsByStudentIdAndAssessmentId(Long studentId, Long assessmentId);
}