package com.conceptbridge.service;

import com.conceptbridge.dto.studentDTO.PDFDTO;
import com.conceptbridge.dto.teacherDTO.PDFUploadRequest;
import com.conceptbridge.entity.PDFCategory;  // Use entity PDFCategory
import com.conceptbridge.entity.User;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PDFService {

    /**
     * Get all PDFs accessible to a student with optional filtering
     * @param student The student requesting the PDFs
     * @param category Optional category filter
     * @param search Optional search term for title/description
     * @return List of PDFDTOs accessible to the student
     */
    List<PDFDTO> getAccessiblePDFs(User student, PDFCategory category, String search);

    /**
     * Upload a new PDF document
     * @param file The PDF file to upload
     * @param request Upload request containing metadata
     * @param uploadedBy The user uploading the PDF
     * @return PDFDTO of the uploaded document
     */
    PDFDTO uploadPDF(MultipartFile file, PDFUploadRequest request, User uploadedBy);

    /**
     * Download a PDF file
     * @param pdfId ID of the PDF to download
     * @param student The student requesting the download
     * @return Resource containing the PDF file
     */
    Resource downloadPDF(Long pdfId, User student);

    /**
     * Increment view count for a PDF
     * @param pdfId ID of the PDF
     * @param student The student viewing the PDF
     */
    void incrementViewCount(Long pdfId, User student);

    /**
     * Delete a PDF document
     * @param pdfId ID of the PDF to delete
     * @param user The user requesting deletion
     */
    void deletePDF(Long pdfId, User user);
//    PDFDocument getPDFById(Long id);
}