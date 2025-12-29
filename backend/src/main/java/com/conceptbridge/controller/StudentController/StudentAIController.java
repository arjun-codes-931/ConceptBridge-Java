package com.conceptbridge.controller.StudentController;

import com.conceptbridge.dto.*;
import com.conceptbridge.dto.AiDTO.ExplanationRequest;
import com.conceptbridge.dto.AiDTO.ExplanationResponse;
import com.conceptbridge.dto.studentDTO.PDFDTO;
import com.conceptbridge.dto.teacherDTO.PDFUploadRequest;
import com.conceptbridge.entity.*;
import com.conceptbridge.exception.ResourceNotFoundException;
import com.conceptbridge.repository.*;
import com.conceptbridge.security.JwtUtil;
import com.conceptbridge.service.GeminiService;
import com.conceptbridge.service.PDFService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentAIController {

    // Service dependencies
    private final GeminiService geminiService;
    private final PDFService pdfService;

    // Repository dependencies - CORRECTED NAMES
    private final PDFDocumentRepository pdfDocumentRepository;  // Changed from pdfRepository
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public StudentAIController(GeminiService geminiService, PDFService pdfService, PDFDocumentRepository pdfDocumentRepository, StudentRepository studentRepository, TeacherRepository teacherRepository, UserRepository userRepository, JwtUtil jwtUtil) {
        this.geminiService = geminiService;
        this.pdfService = pdfService;
        this.pdfDocumentRepository = pdfDocumentRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/ai/explain")
    public ResponseEntity<ApiResponse<ExplanationResponse>> explainContent(
            @Valid @RequestBody ExplanationRequest request,
            @AuthenticationPrincipal User user) {

        ExplanationResponse response = geminiService.explainContent(request, user);

        return ResponseEntity.ok(ApiResponse.success(
                "Explanation generated successfully",
                response
        ));
    }

    @GetMapping("/pdfs")
    public ResponseEntity<ApiResponse<List<PDFDTO>>> getPDFs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal User user) {

        // Log the user for debugging
        System.out.println("getPDFs called - User: " + (user != null ? user.getUsername() : "null"));

        PDFCategory pdfCategory = null;
        if (category != null && !category.isEmpty()) {
            try {
                pdfCategory = PDFCategory.valueOf(category.toUpperCase());
            } catch (IllegalArgumentException e) {
                System.out.println("Invalid category: " + category);
            }
        }

        List<PDFDTO> pdfs = pdfService.getAccessiblePDFs(user, pdfCategory, search);

        return ResponseEntity.ok(ApiResponse.success(
                "PDFs retrieved successfully",
                pdfs
        ));
    }

    @PostMapping("/pdfs/upload")
    public ResponseEntity<ApiResponse<PDFDTO>> uploadPDF(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("category") String category,
            @RequestParam(value = "isPublic", defaultValue = "true") Boolean isPublic,
            @AuthenticationPrincipal User user) {

        PDFUploadRequest uploadRequest =
                new PDFUploadRequest(
                        title,
                        description,
                        category,
                        isPublic,
                        null  // or accessibleStudentIds if you need them
                );

        PDFDTO pdf = pdfService.uploadPDF(file, uploadRequest, user);

        return ResponseEntity.ok(ApiResponse.success(
                "PDF uploaded successfully",
                pdf
        ));
    }

    @GetMapping("/pdfs/{id}/download")
    public ResponseEntity<Resource> downloadPDF(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        Resource resource = pdfService.downloadPDF(id, user);

        String filename = "document.pdf"; // In production, get actual filename

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    @GetMapping("/pdfs/{id}/preview")
    public ResponseEntity<Resource> previewPDF(
            @PathVariable Long id,
            HttpServletRequest request) {

        try {
            System.out.println("Preview PDF called for ID: " + id);

            // 1. Extract user from JWT token
            String token = extractTokenFromRequest(request);
            User user = null;

            // FIX: Use the injected jwtUtil, don't create new instance
            if (token != null && jwtUtil.validateToken(token)) {
                String username = jwtUtil.extractUsername(token);
                user = userRepository.findByUsername(username)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                System.out.println("User authenticated: " + username +
                        ", Role: " + user.getRole() +
                        ", Name: " + user.getFirstName() + " " + user.getLastName());

                // Get student name if user is a student
                if (user.getRole().equals("ROLE_STUDENT")) {
                    Student student = studentRepository.findByUserId(user.getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
                    System.out.println("Student accessing PDF: " +
                            student.getFirstName() + " " + student.getLastName() +
                            ", Branch: " + student.getBranch());
                }
            } else {
                System.out.println("No valid token found, allowing access for now");
                // You might want to check if token exists at all
                if (token == null) {
                    System.out.println("No Authorization header found");
                } else {
                    System.out.println("Token found but invalid: " + token.substring(0, Math.min(20, token.length())) + "...");
                }
            }

            // 2. Get PDF
            PDFDocument pdf = pdfDocumentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("PDF not found"));

            System.out.println("PDF found: " + pdf.getTitle());
            System.out.println("File path: " + pdf.getFilePath());

            // 3. Try to load the file - fix the helper method
            Resource resource = loadPDFResource(pdf);

            // 4. Increment view count (even if user is null)
            if (user != null) {
                pdfService.incrementViewCount(id, user);
            } else {
                // Still increment view count for anonymous views
                pdf.setViewCount(pdf.getViewCount() + 1);
                pdfDocumentRepository.save(pdf);
            }

            // 5. Return PDF with student name in response headers (optional)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("inline", pdf.getFileName());

            // Add student name to headers if available
            if (user != null) {
                headers.add("X-Student-Name", user.getFirstName() + " " + user.getLastName());
                headers.add("X-Student-Username", user.getUsername());
            }

            return new ResponseEntity<>(resource, headers, HttpStatus.OK);

        } catch (Exception e) {
            System.err.println("Error in previewPDF: " + e.getMessage());
            e.printStackTrace();

            // Return error with student info if available
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to load PDF: " + e.getMessage());
            error.put("timestamp", new Date());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(null);
        }
    }

    // Helper method to extract token
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    // Helper method to load PDF resource
    private Resource loadPDFResource(PDFDocument pdf) throws Exception {
        // Try multiple possible file paths
        String[] possiblePaths = {
                pdf.getFilePath(),
                "uploads/pdfs/" + pdf.getFileName(),
                pdf.getFilePath().replace("\\", "/"),
                pdf.getFilePath().replace("C:/Users/arjun/Pictures/ConceptBridge-Java-master/backend/", ""),
                "C:/Users/arjun/Pictures/ConceptBridge-Java-master/backend/uploads/pdfs/" + pdf.getFileName(),
                System.getProperty("user.dir") + "/uploads/pdfs/" + pdf.getFileName()
        };

        for (String path : possiblePaths) {
            try {
                System.out.println("Trying to load from: " + path);
                File file = new File(path);
                if (file.exists() && file.canRead()) {
                    System.out.println("✓ File found at: " + path);
                    return new UrlResource(file.toURI());
                } else {
                    System.out.println("✗ File not found or not readable: " + path);
                }
            } catch (Exception e) {
                System.out.println("✗ Error loading from: " + path + " - " + e.getMessage());
            }
        }

        throw new RuntimeException("PDF file not found in any location. Tried: " + String.join(", ", possiblePaths));
    }

    private boolean hasDepartmentAccess(PDFDocument pdf, User user) {
        // Allow admins and teachers full access
        if (user.getRole().equals("ROLE_ADMIN") || user.getRole().equals("ROLE_TEACHER")) {
            System.out.println("Allowing access for admin/teacher role: " + user.getRole());
            return true;
        }

        // For students, check department
        if (user.getRole().equals("ROLE_STUDENT")) {
            try {
                // Get the student entity to access branch
                Student student = studentRepository.findByUserId(user.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

                System.out.println("Student found: " + student.getUsername() + ", Branch: " + student.getBranch());

                // Get the teacher who uploaded the PDF
                User uploader = pdf.getUploadedBy();
                if (uploader == null) {
                    // If no uploader, allow access for now
                    System.out.println("No uploader specified for PDF, allowing access");
                    return true;
                }

                System.out.println("PDF uploaded by user ID: " + uploader.getId() + ", Username: " + uploader.getUsername());

                // Get teacher's department
                Teacher teacher = teacherRepository.findByUserId(uploader.getId())
                        .orElse(null);

                if (teacher == null) {
                    System.out.println("Teacher not found for user ID: " + uploader.getId());
                    // If uploader is not a teacher, check if they're admin
                    if (uploader.getRole().equals("ROLE_ADMIN")) {
                        System.out.println("Uploader is admin, allowing access");
                        return true;
                    }
                    return false; // Deny if uploader is not teacher/admin
                }

                if (teacher.getDepartment() == null) {
                    System.out.println("Teacher has no department specified");
                    return true; // Allow if no department specified
                }

                // Check if student's branch matches teacher's department
                boolean hasAccess = teacher.getDepartment().equalsIgnoreCase(student.getBranch());

                System.out.println("Department check - Student branch: " + student.getBranch() +
                        ", Teacher department: " + teacher.getDepartment() +
                        ", Has access: " + hasAccess);

                return hasAccess;

            } catch (Exception e) {
                System.err.println("Error checking department access: " + e.getMessage());
                e.printStackTrace();
                return false; // Deny access on error
            }
        }

        // Deny access for other roles
        System.out.println("Access denied for unknown role: " + (user != null ? user.getRole() : "null"));
        return false;
    }

    @DeleteMapping("/pdfs/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePDF(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        pdfService.deletePDF(id, user);

        return ResponseEntity.ok(ApiResponse.success(
                "PDF deleted successfully",
                null
        ));
    }

    @GetMapping("/test")
    @ResponseBody
    public String test() {
        System.out.println("Test endpoint hit at: " + new Date());
        return "Server is running! Time: " + new Date();
    }

    @PostMapping("/test/upload")
    public ResponseEntity<String> testUpload(@RequestParam("file") MultipartFile file) {
        System.out.println("Test upload received!");
        System.out.println("File name: " + file.getOriginalFilename());
        System.out.println("File size: " + file.getSize());
        System.out.println("Content type: " + file.getContentType());

        return ResponseEntity.ok("File received: " + file.getOriginalFilename() +
                " (" + file.getSize() + " bytes)");
    }

    // Add a debug endpoint to test PDF access
    @GetMapping("/debug/pdf/{id}")
    public ResponseEntity<Map<String, Object>> debugPDF(@PathVariable Long id, @AuthenticationPrincipal User user) {
        Map<String, Object> response = new HashMap<>();

        try {
            PDFDocument pdf = pdfDocumentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("PDF not found"));

            response.put("pdfId", pdf.getId());
            response.put("title", pdf.getTitle());
            response.put("filePath", pdf.getFilePath());
            response.put("fileName", pdf.getFileName());

            // Check uploadedBy
            User uploader = pdf.getUploadedBy();
            response.put("uploadedBy", uploader != null ? uploader.getUsername() : "null");
            response.put("uploaderId", uploader != null ? uploader.getId() : "null");
            response.put("uploaderRole", uploader != null ? uploader.getRole() : "null");

            // Check file existence
            File file = new File(pdf.getFilePath());
            response.put("fileExists", file.exists());
            response.put("absolutePath", file.getAbsolutePath());

            // Check if user is student
            if (user != null) {
                response.put("currentUser", user.getUsername());
                response.put("currentUserId", user.getId());
                response.put("currentUserRole", user.getRole());

                if (user.getRole().equals("ROLE_STUDENT")) {
                    Student student = studentRepository.findByUserId(user.getId()).orElse(null);
                    response.put("studentBranch", student != null ? student.getBranch() : "null");

                    if (uploader != null) {
                        Teacher teacher = teacherRepository.findByUserId(uploader.getId()).orElse(null);
                        response.put("teacherDepartment", teacher != null ? teacher.getDepartment() : "null");

                        boolean access = hasDepartmentAccess(pdf, user);
                        response.put("hasDepartmentAccess", access);
                    }
                }
            }

            response.put("success", true);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    // Simple endpoint to test if PDF loads without authentication
    @GetMapping("/test/pdf/{id}")
    public ResponseEntity<Resource> testPDFLoad(@PathVariable Long id) {
        try {
            PDFDocument pdf = pdfDocumentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("PDF not found"));

            System.out.println("Testing PDF load: " + pdf.getTitle());
            System.out.println("File path: " + pdf.getFilePath());

            // Try to load file
            File file = new File(pdf.getFilePath());
            if (!file.exists()) {
                System.out.println("File not found at: " + pdf.getFilePath());
                // Try alternative
                String altPath = "uploads/pdfs/" + pdf.getFileName();
                file = new File(altPath);
                System.out.println("Trying alternative: " + altPath);
            }

            if (file.exists()) {
                Resource resource = new UrlResource(file.toURI());
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + pdf.getFileName() + "\"")
                        .contentType(MediaType.APPLICATION_PDF)
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null);
            }

        } catch (Exception e) {
            System.err.println("Error in testPDFLoad: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
}