package com.conceptbridge.service.impl;

import com.conceptbridge.dto.studentDTO.PDFDTO;
import com.conceptbridge.dto.teacherDTO.PDFUploadRequest;
import com.conceptbridge.entity.*;
import com.conceptbridge.exception.AccessDeniedException;
import com.conceptbridge.exception.FileUploadException;
import com.conceptbridge.exception.ResourceNotFoundException;
import com.conceptbridge.repository.PDFDocumentRepository;
import com.conceptbridge.repository.StudentRepository;
import com.conceptbridge.repository.UserRepository;
import com.conceptbridge.service.PDFService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PDFServiceImpl implements PDFService {

    private static final Logger log = LoggerFactory.getLogger(PDFServiceImpl.class);

    @Value("${file.upload.dir:uploads/pdfs}")
    private String uploadDir;

    @Value("${server.url:http://localhost:8080}")
    private String serverUrl;

    private final PDFDocumentRepository pdfDocumentRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    public PDFServiceImpl(PDFDocumentRepository pdfDocumentRepository, UserRepository userRepository, StudentRepository studentRepository) {
        this.pdfDocumentRepository = pdfDocumentRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
    }


//    @Override
//    public PDFDocument getPDFById(Long id) {
//        return pdfDocumentRepository.findById(id)
//                .orElseThrow(() -> new ResourceNotFoundException("PDF not found with id: " + id));
//    }
    @Override
    public List<PDFDTO> getAccessiblePDFs(User user, PDFCategory category, String search) {
        // SIMPLEST: Just get all PDFs for now to test
        List<PDFDocument> pdfs = pdfDocumentRepository.findAll();

        System.out.println("Total PDFs in database: " + pdfs.size());

        // Simple filtering
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            pdfs = pdfs.stream()
                    .filter(p -> p.getTitle().toLowerCase().contains(searchLower) ||
                            (p.getDescription() != null &&
                                    p.getDescription().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
            System.out.println("After search filter: " + pdfs.size());
        }

        if (category != null) {
            pdfs = pdfs.stream()
                    .filter(p -> p.getCategory() == category)
                    .collect(Collectors.toList());
            System.out.println("After category filter: " + pdfs.size());
        }

        return pdfs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PDFDTO uploadPDF(MultipartFile file, PDFUploadRequest request, User uploadedBy) {
        try {
            // Validate file
            validateFile(file);

            // Check if user has permission to upload (should be teacher)
            log.info("PDF uploaded by: {} (ID: {})", uploadedBy.getUsername(), uploadedBy.getId());

            // Prepare upload directory
            Path uploadPath = prepareUploadDirectory();

            // Generate unique filename
            String uniqueFilename = generateUniqueFilename(file);
            Path filePath = uploadPath.resolve(uniqueFilename);

            // Save file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Create PDF document
            PDFDocument pdf = createPDFDocument(file, request, uploadedBy, uniqueFilename, filePath);

            PDFDocument savedPdf = pdfDocumentRepository.save(pdf);
            log.info("PDF uploaded successfully: {}", savedPdf.getTitle());

            return convertToDTO(savedPdf);

        } catch (IOException e) {
            log.error("File upload failed", e);
            throw new FileUploadException("Failed to upload PDF: " + e.getMessage(), e);
        }
    }

    @Override
    public Resource downloadPDF(Long pdfId, User student) {
        PDFDocument pdf = pdfDocumentRepository.findById(pdfId)
                .orElseThrow(() -> new ResourceNotFoundException("PDF not found"));

        log.info("Student {} accessing PDF {}", student.getUsername(), pdf.getTitle());

        try {
            // Increment view count
            pdf.setViewCount(pdf.getViewCount() + 1);
            pdfDocumentRepository.save(pdf);

            // Load file as resource
            Path filePath = Paths.get(pdf.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("PDF file not found or not readable");
            }

            return resource;

        } catch (MalformedURLException e) {
            log.error("Invalid file path", e);
            throw new FileUploadException("Error accessing PDF file", e);
        }
    }

    @Override
    public void incrementViewCount(Long pdfId, User student) {
        pdfDocumentRepository.findById(pdfId)
                .ifPresent(pdf -> {
                    pdf.setViewCount(pdf.getViewCount() + 1);
                    pdfDocumentRepository.save(pdf);
                    log.info("View count incremented for PDF {} by student {}", pdfId, student.getUsername());
                });
    }

    @Override
    public void deletePDF(Long pdfId, User user) {
        PDFDocument pdf = pdfDocumentRepository.findById(pdfId)
                .orElseThrow(() -> new ResourceNotFoundException("PDF not found"));

        // Only allow teachers/admins to delete - check role field directly
        String userRole = user.getRole();
        boolean canDelete = userRole != null &&
                (userRole.equals("TEACHER") || userRole.equals("ADMIN"));

        if (!canDelete) {
            throw new AccessDeniedException("Only teachers can delete PDFs");
        }

        try {
            // Delete file
            Path filePath = Paths.get(pdf.getFilePath());
            Files.deleteIfExists(filePath);

            // Delete database record
            pdfDocumentRepository.delete(pdf);
            log.info("PDF deleted: {}", pdf.getTitle());

        } catch (IOException e) {
            log.error("Failed to delete PDF file", e);
            throw new FileUploadException("Failed to delete PDF file", e);
        }
    }

    // ========== HELPER METHODS ==========

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new FileUploadException("File is empty");
        }

        // Check file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new FileUploadException("Only PDF files are allowed");
        }

        // Check file size (e.g., max 10MB)
        long maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.getSize() > maxSize) {
            throw new FileUploadException("File size exceeds maximum limit of 10MB");
        }

        // Check filename
        String filename = file.getOriginalFilename();
        if (filename == null || filename.trim().isEmpty()) {
            throw new FileUploadException("Invalid file name");
        }

        if (!filename.toLowerCase().endsWith(".pdf")) {
            throw new FileUploadException("File must have .pdf extension");
        }
    }

    private Path prepareUploadDirectory() throws IOException {
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            log.info("Created upload directory: {}", uploadPath.toAbsolutePath());
        }

        return uploadPath;
    }

    private String generateUniqueFilename(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        String baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.'));
        String extension = originalFilename.substring(originalFilename.lastIndexOf('.'));

        // Clean the base name (remove special characters)
        String cleanBaseName = baseName.replaceAll("[^a-zA-Z0-9.-]", "_");

        // Add timestamp and UUID for uniqueness
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);

        return String.format("%s_%s_%s%s", cleanBaseName, timestamp, uuid, extension);
    }

    private PDFDocument createPDFDocument(MultipartFile file, PDFUploadRequest request,
                                          User uploadedBy, String filename, Path filePath) {
        PDFDocument pdf = new PDFDocument();
        pdf.setTitle(request.getTitle());
        pdf.setDescription(request.getDescription());
        pdf.setFileName(filename);
        pdf.setFilePath(filePath.toString());
        pdf.setFileType(FileType.PDF);
        pdf.setFileSize(file.getSize());

        // Handle category conversion safely
        try {
            pdf.setCategory(PDFCategory.valueOf(request.getCategory().toUpperCase()));
        } catch (IllegalArgumentException e) {
            pdf.setCategory(PDFCategory.OTHER);
        }

        pdf.setUploadedBy(uploadedBy);
        pdf.setUploadDate(LocalDateTime.now());
        pdf.setViewCount(0);
        pdf.setDownloadCount(0);

        // Set isPublic from request (default to true if not provided)
        pdf.setIsPublic(request.getIsPublic() != null ? request.getIsPublic() : true);

        // Note: You'll need to handle accessibleStudents separately
        // if (request.getAccessibleStudentIds() != null) {
        //     Set<User> accessibleStudents = userRepository.findAllById(request.getAccessibleStudentIds());
        //     pdf.setAccessibleStudents(accessibleStudents);
        // }

        return pdf;
    }

    private PDFDTO convertToDTO(PDFDocument pdf) {
        PDFDTO dto = new PDFDTO();
        dto.setId(pdf.getId());
        dto.setTitle(pdf.getTitle());
        dto.setDescription(pdf.getDescription());
        dto.setCategory(pdf.getCategory() != null ? pdf.getCategory().name() : null);
        dto.setFileSize(pdf.getFileSize());
        dto.setFileType(pdf.getFileType() != null ? pdf.getFileType().name() : null);
        dto.setUploadDate(pdf.getUploadDate() != null ?
                pdf.getUploadDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : null);

        if (pdf.getUploadedBy() != null) {
            dto.setUploaderName(pdf.getUploadedBy().getFirstName() + " " + pdf.getUploadedBy().getLastName());
            dto.setUploaderId(pdf.getUploadedBy().getId());
        }

        dto.setViewCount(pdf.getViewCount());
        dto.setDownloadCount(pdf.getDownloadCount());
        dto.setDownloadUrl(serverUrl + "/api/student/pdfs/" + pdf.getId() + "/download");
        dto.setPreviewUrl(serverUrl + "/api/student/pdfs/" + pdf.getId() + "/preview");
        dto.setThumbnailUrl(generateThumbnailUrl(pdf));

        return dto;
    }

    private String generateThumbnailUrl(PDFDocument pdf) {
        return serverUrl + "/api/pdfs/" + pdf.getId() + "/thumbnail";
    }
}