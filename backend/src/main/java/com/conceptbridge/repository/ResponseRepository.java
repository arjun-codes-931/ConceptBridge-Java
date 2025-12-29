package com.conceptbridge.repository;

import com.conceptbridge.entity.StudentResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResponseRepository extends JpaRepository<StudentResponse, Long> {

    @Query("SELECT sr FROM StudentResponse sr WHERE sr.student.id = :studentId")
    List<StudentResponse> findByStudentId(@Param("studentId") Long studentId);

//    @Query("SELECT sr FROM StudentResponse sr WHERE sr.assessment.id = :assessmentId")
//    List<StudentResponse> findByAssessmentId(@Param("assessmentId") Long assessmentId);

//    @Query("SELECT sr FROM StudentResponse sr WHERE sr.question.id = :questionId")
//    List<StudentResponse> findByQuestionId(@Param("questionId") Long questionId);
//
//    @Query("SELECT sr FROM StudentResponse sr WHERE sr.student.id = :studentId AND sr.assessment.id = :assessmentId")
//    List<StudentResponse> findByStudentIdAndAssessmentId(@Param("studentId") Long studentId,
//                                                         @Param("assessmentId") Long assessmentId);

//    @Query("SELECT COUNT(sr) FROM StudentResponse sr WHERE sr.assessment.id = :assessmentId AND sr.isCorrect = true")
//    Long countCorrectResponsesByAssessmentId(@Param("assessmentId") Long assessmentId);

    @Query("SELECT AVG(sr.pointsObtained) FROM StudentResponse sr WHERE sr.assessment.id = :assessmentId")
    Double findAverageScoreByAssessmentId(@Param("assessmentId") Long assessmentId);

//    @Query("SELECT COUNT(sr) FROM StudentResponse sr WHERE sr.assessment.id = :assessmentId")
//    Long countResponsesByAssessmentId(@Param("assessmentId") Long assessmentId);
}