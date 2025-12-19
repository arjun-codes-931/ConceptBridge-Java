package com.conceptbridge.service;

import com.conceptbridge.dto.*;
import java.util.List;

public interface QuizService {
    List<QuizDTO> getAvailableQuizzesForStudent(String username);
    QuizDTO getQuizById(Long quizId);
    List<QuizQuestionDTO> getQuizQuestionsForStudent(Long quizId, String username);
    QuizAttemptDTO startQuizAttempt(Long quizId, String username);
    AnswerResultDTO submitAnswer(Long attemptId, Long questionId, String selectedAnswer, String username);
    QuizResultDTO completeQuizAttempt(Long attemptId, String username);
    List<QuizAttemptDTO> getQuizHistory(String username);
}