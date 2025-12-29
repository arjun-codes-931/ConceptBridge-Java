package com.conceptbridge.repository;

import com.conceptbridge.entity.PDFCategory;
import com.conceptbridge.entity.PDFDocument;
import com.conceptbridge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PDFDocumentRepository extends JpaRepository<PDFDocument, Long> {

    // Add @Query annotation for custom query methods
//    @Query("SELECT p FROM PDFDocument p WHERE " +
//            "(:category IS NULL OR p.category = :category) " +
//            "AND (:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
//            "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
//    List<PDFDocument> findFilteredPDFs(
//            @Param("category") PDFCategory category,
//            @Param("search") String search
//    );

    // Search method (add this)
//    @Query("SELECT p FROM PDFDocument p WHERE " +
//            "(:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
//            "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
//    List<PDFDocument> searchPDFs(@Param("search") String search);

    // New method: Find PDFs for a specific department
//    @Query("SELECT p FROM PDFDocument p " +
//            "JOIN p.uploadedBy u " +
//            "JOIN Teacher t ON u.id = t.id " +
//            "WHERE t.department = :department " +
//            "AND p.isPublic = true")
//    List<PDFDocument> findByUploaderDepartment(@Param("department") String department);

    // New method: Filter PDFs by category/search for a department
//    @Query("SELECT p FROM PDFDocument p " +
//            "JOIN p.uploadedBy u " +
//            "JOIN Teacher t ON u.id = t.id " +
//            "WHERE t.department = :department " +
//            "AND p.isPublic = true " +
//            "AND (:category IS NULL OR p.category = :category) " +
//            "AND (:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
//            "     OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
//    List<PDFDocument> findFilteredPDFsForDepartment(
//            @Param("category") PDFCategory category,
//            @Param("search") String search,
//            @Param("department") String department
//    );

    // Find PDFs for teacher (their own + public)
//    @Query("SELECT p FROM PDFDocument p " +
//            "WHERE (p.uploadedBy.id = :teacherId OR p.isPublic = true) " +
//            "AND (:category IS NULL OR p.category = :category) " +
//            "AND (:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
//            "     OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
//    List<PDFDocument> findFilteredPDFsForTeacher(
//            @Param("category") PDFCategory category,
//            @Param("search") String search,
//            @Param("teacherId") Long teacherId
//    );

    // These methods follow naming convention, no @Query needed
//    List<PDFDocument> findByUploadedByOrIsPublic(User uploadedBy, Boolean isPublic);

//    List<PDFDocument> findByIsPublic(Boolean isPublic);

    // Optional: Add this method if you need it
//    List<PDFDocument> findByUploadedBy(User uploadedBy);

    // Find by category
//    List<PDFDocument> findByCategory(PDFCategory category);
}