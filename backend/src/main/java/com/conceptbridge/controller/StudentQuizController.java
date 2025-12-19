package com.conceptbridge.controller;

import com.conceptbridge.dto.*;
import com.conceptbridge.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/quizzes")
public class StudentQuizController {

    @Autowired
    private QuizService quizService;

    /**
     * GET /api/student/quizzes - Get all available quizzes
     */
    @GetMapping
    public ResponseEntity<List<QuizDTO>> getAvailableQuizzes(Authentication authentication) {
        String username = authentication.getName();
        List<QuizDTO> quizzes = quizService.getAvailableQuizzesForStudent(username);
        return ResponseEntity.ok(quizzes);
    }

    /**
     * GET /api/student/quizzes/{quizId} - Get quiz by ID
     */
    @GetMapping("/{quizId}")
    public ResponseEntity<QuizDTO> getQuizById(@PathVariable Long quizId) {
        QuizDTO quiz = quizService.getQuizById(quizId);
        return ResponseEntity.ok(quiz);
    }

    /**
     * GET /api/student/quizzes/{quizId}/questions - Get quiz questions
     * This endpoint is called by your frontend
     */
    @GetMapping("/{quizId}/questions")
    public ResponseEntity<List<QuizQuestionDTO>> getQuizQuestions(
            @PathVariable Long quizId,
            Authentication authentication) {
        String username = authentication.getName();
        List<QuizQuestionDTO> questions = quizService.getQuizQuestionsForStudent(quizId, username);
        return ResponseEntity.ok(questions);
    }

    /**
     * POST /api/student/quizzes/{quizId}/start - Start quiz attempt
     */
    @PostMapping("/{quizId}/start")
    public ResponseEntity<QuizAttemptDTO> startQuiz(
            @PathVariable Long quizId,
            Authentication authentication) {
        String username = authentication.getName();
        QuizAttemptDTO attempt = quizService.startQuizAttempt(quizId, username);
        return ResponseEntity.ok(attempt);
    }

    /**
     * POST /api/student/quizzes/attempt/{attemptId}/answer - Submit answer
     */
    @PostMapping("/attempt/{attemptId}/answer")
    public ResponseEntity<AnswerResultDTO> submitAnswer(
            @PathVariable Long attemptId,
            @RequestBody SubmitAnswerDTO submitAnswerDTO,
            Authentication authentication) {
        String username = authentication.getName();
        AnswerResultDTO result = quizService.submitAnswer(
                attemptId,
                submitAnswerDTO.getQuestionId(),
                submitAnswerDTO.getSelectedAnswer(),
                username
        );
        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/student/quizzes/attempt/{attemptId}/complete - Complete quiz
     */
    @PostMapping("/attempt/{attemptId}/complete")
    public ResponseEntity<QuizResultDTO> completeQuiz(
            @PathVariable Long attemptId,
            Authentication authentication) {
        String username = authentication.getName();
        QuizResultDTO result = quizService.completeQuizAttempt(attemptId, username);
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/student/quizzes/history - Get quiz history
     */
    @GetMapping("/history")
    public ResponseEntity<List<QuizAttemptDTO>> getQuizHistory(Authentication authentication) {
        String username = authentication.getName();
        List<QuizAttemptDTO> history = quizService.getQuizHistory(username);
        return ResponseEntity.ok(history);
    }
}