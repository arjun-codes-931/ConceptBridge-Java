package com.conceptbridge.repository;

import com.conceptbridge.entity.AIExplanationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AIExplanationHistoryRepository extends JpaRepository<AIExplanationHistory, Long> {

//    List<AIExplanationHistory> findByStudentIdOrderByCreatedAtDesc(Long studentId);
//
//    @Query("SELECT e FROM AIExplanationHistory e WHERE e.student.id = :studentId AND e.isSaved = true")
//    List<AIExplanationHistory> findSavedExplanations(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(e) FROM AIExplanationHistory e WHERE e.student.id = :studentId AND DATE(e.createdAt) = :date")
    Integer countExplanationsByDate(@Param("studentId") Long studentId, @Param("date") LocalDate date);

//    @Query("SELECT COUNT(e) FROM AIExplanationHistory e WHERE e.pdfDocument.id = :pdfId")
//    Integer countExplanationsByPdf(@Param("pdfId") Long pdfId);
}