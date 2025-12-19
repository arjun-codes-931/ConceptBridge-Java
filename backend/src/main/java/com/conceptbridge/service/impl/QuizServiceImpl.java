package com.conceptbridge.service.impl;

import com.conceptbridge.dto.*;
import com.conceptbridge.entity.*;
import com.conceptbridge.repository.*;
import com.conceptbridge.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuizServiceImpl implements QuizService {
    @Autowired
    private  QuizRepository quizRepository;
    @Autowired
    private  UserRepository userRepository;
    @Autowired
    private  StudentQuizAttemptRepository attemptRepository;
    @Autowired
    private  StudentAnswerRepository answerRepository;
    @Autowired
    private  QuizQuestionRepository quizQuestionRepository;

    @Override
    public List<QuizDTO> getAvailableQuizzesForStudent(String username) {
        User student = userRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Quiz> quizzes = quizRepository.findActiveQuizzes();

        return quizzes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public QuizDTO getQuizById(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        return convertToDTO(quiz);
    }

    @Override
    public List<QuizQuestionDTO> getQuizQuestionsForStudent(Long quizId, String username) {
        User student = userRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        // Get quiz questions using quiz question repository
        List<QuizQuestion> questions = quizQuestionRepository.findByQuizId(quizId);

        return questions.stream()
                .map(this::convertQuestionToDTOWithoutAnswers)
                .collect(Collectors.toList());
    }

    @Override
    public QuizAttemptDTO startQuizAttempt(Long quizId, String username) {
        User student = userRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        // Check if there's an existing in-progress attempt
        StudentQuizAttempt existingAttempt = attemptRepository
                .findByStudentAndQuizAndStatus(student, quiz, StudentQuizAttempt.AttemptStatus.IN_PROGRESS);

        if (existingAttempt != null) {
            return convertToAttemptDTO(existingAttempt);
        }

        // Create new attempt
        StudentQuizAttempt attempt = new StudentQuizAttempt();
        attempt.setStudent(student);
        attempt.setQuiz(quiz);
        attempt.setStatus(StudentQuizAttempt.AttemptStatus.IN_PROGRESS);
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setTotalQuestions(quiz.getQuestions().size());

        attemptRepository.save(attempt);

        return convertToAttemptDTO(attempt);
    }

    @Override
    public AnswerResultDTO submitAnswer(Long attemptId, Long questionId, String selectedAnswer, String username) {
        StudentQuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        // Verify student owns this attempt
        if (!attempt.getStudent().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }

        QuizQuestion question = attempt.getQuiz().getQuestions().stream()
                .filter(q -> q.getId().equals(questionId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // Check if answer already exists
        StudentAnswer existingAnswer = answerRepository
                .findByAttemptAndQuestion(attempt, question);

        StudentAnswer answer;
        if (existingAnswer != null) {
            answer = existingAnswer;
        } else {
            answer = new StudentAnswer();
            answer.setAttempt(attempt);
            answer.setQuestion(question);
        }

        answer.setSelectedAnswer(selectedAnswer);
        answer.setAnsweredAt(LocalDateTime.now());

        // Check if answer is correct
        boolean isCorrect = selectedAnswer.equals(question.getCorrectAnswer());
        answer.setCorrect(isCorrect);
        answer.setPointsObtained(isCorrect ? question.getPoints() : 0);

        answerRepository.save(answer);

        // Create result DTO
        AnswerResultDTO result = new AnswerResultDTO();
        result.setQuestionId(questionId);
        result.setCorrect(isCorrect);
        result.setCorrectAnswer(question.getCorrectAnswer());
        result.setPointsObtained(answer.getPointsObtained());

        // You can add explanation logic here
        String explanation = getExplanationForQuestion(question, selectedAnswer);
        result.setExplanation(explanation);
        result.setAnsweredAt(LocalDateTime.now());

        return result;
    }

    @Override
    public QuizResultDTO completeQuizAttempt(Long attemptId, String username) {
        StudentQuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        // Verify student owns this attempt
        if (!attempt.getStudent().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }

        // Calculate score
        List<StudentAnswer> answers = answerRepository.findByAttempt(attempt);
        int correctAnswers = (int) answers.stream()
                .filter(StudentAnswer::getCorrect)
                .count();
        int totalPoints = answers.stream()
                .mapToInt(StudentAnswer::getPointsObtained)
                .sum();
        int totalPossiblePoints = attempt.getQuiz().getQuestions().stream()
                .mapToInt(QuizQuestion::getPoints)
                .sum();

        int scorePercentage = totalPossiblePoints > 0 ?
                (totalPoints * 100) / totalPossiblePoints : 0;

        // Update attempt
        attempt.setCorrectAnswers(correctAnswers);
        attempt.setWrongAnswers(answers.size() - correctAnswers);
        attempt.setScore(scorePercentage);
        attempt.setStatus(StudentQuizAttempt.AttemptStatus.COMPLETED);
        attempt.setCompletedAt(LocalDateTime.now());

        // Calculate time taken
        if (attempt.getStartedAt() != null && attempt.getCompletedAt() != null) {
            long seconds = java.time.Duration.between(
                    attempt.getStartedAt(), attempt.getCompletedAt()
            ).getSeconds();
            attempt.setTimeTaken((int) seconds);
        }

        attemptRepository.save(attempt);

        // Create result DTO
        QuizResultDTO result = new QuizResultDTO();
        result.setAttemptId(attemptId);
        result.setQuizId(attempt.getQuiz().getId());
        result.setQuizTitle(attempt.getQuiz().getTitle());
        result.setScorePercentage(scorePercentage);
        result.setTotalQuestions(attempt.getTotalQuestions());
        result.setCorrectAnswers(correctAnswers);
        result.setTotalPoints(totalPoints);
        result.setPassed(scorePercentage >= attempt.getQuiz().getPassingScore());
        result.setPassingScore(attempt.getQuiz().getPassingScore());
        result.setCompletedAt(LocalDateTime.now());

        return result;
    }

    @Override
    public List<QuizAttemptDTO> getQuizHistory(String username) {
        User student = userRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<StudentQuizAttempt> attempts = attemptRepository
                .findByStudentOrderByCompletedAtDesc(student);

        return attempts.stream()
                .map(this::convertToAttemptDTO)
                .collect(Collectors.toList());
    }

    private QuizDTO convertToDTO(Quiz quiz) {
        QuizDTO dto = new QuizDTO();
        dto.setId(quiz.getId());
        dto.setTitle(quiz.getTitle());
        dto.setDescription(quiz.getDescription());
        dto.setTeacherId(quiz.getTeacher().getId());
        dto.setTeacherName(quiz.getTeacher().getUsername());
        dto.setTopicId(quiz.getTopic() != null ? quiz.getTopic().getId() : null);
        dto.setTopicName(quiz.getTopic() != null ? quiz.getTopic().getTitle() : null);
        dto.setStatus(quiz.getStatus().name());
        dto.setDuration(quiz.getDuration());
        dto.setTotalQuestions(quiz.getTotalQuestions());
        dto.setPassingScore(quiz.getPassingScore());
        dto.setCreatedAt(quiz.getCreatedAt());

        // Convert questions (without correct answers to prevent cheating)
        if (quiz.getQuestions() != null) {
            List<QuizQuestionDTO> questionDTOs = quiz.getQuestions().stream()
                    .map(this::convertQuestionToDTOWithoutAnswers)
                    .collect(Collectors.toList());
            dto.setQuestions(questionDTOs);
        }

        return dto;
    }

    private QuizQuestionDTO convertQuestionToDTO(QuizQuestion question) {
        QuizQuestionDTO dto = new QuizQuestionDTO();
        dto.setId(question.getId());
        dto.setQuestionText(question.getQuestionText());
        dto.setQuestionType(question.getQuestionType().name());
        dto.setPoints(question.getPoints());
        dto.setCorrectAnswer(question.getCorrectAnswer());

        // Convert options (but don't reveal correct answers yet)
        if (question.getOptions() != null) {
            List<QuestionOptionDTO> optionDTOs = question.getOptions().stream()
                    .map(this::convertOptionToDTO)
                    .collect(Collectors.toList());
            dto.setOptions(optionDTOs);
        }

        return dto;
    }

    private QuizQuestionDTO convertQuestionToDTOWithoutAnswers(QuizQuestion question) {
        QuizQuestionDTO dto = new QuizQuestionDTO();
        dto.setId(question.getId());
        dto.setQuestionText(question.getQuestionText());
        dto.setQuestionType(question.getQuestionType().name());
        dto.setPoints(question.getPoints());
        // Don't send correct answer to prevent cheating
        dto.setCorrectAnswer(null);

        // Convert options (but don't reveal correct answers)
        if (question.getOptions() != null) {
            List<QuestionOptionDTO> optionDTOs = question.getOptions().stream()
                    .map(this::convertOptionToDTOWithoutAnswer)
                    .collect(Collectors.toList());
            dto.setOptions(optionDTOs);
        }

        return dto;
    }

    private QuestionOptionDTO convertOptionToDTO(QuizOption option) {
        QuestionOptionDTO dto = new QuestionOptionDTO();
        dto.setId(option.getId());
        dto.setOptionText(option.getOptionText());
        dto.setOptionOrder(option.getOptionOrder());
        // Don't send isCorrect to frontend to prevent cheating
        dto.setCorrect(null);

        return dto;
    }

    private QuestionOptionDTO convertOptionToDTOWithoutAnswer(QuizOption option) {
        QuestionOptionDTO dto = new QuestionOptionDTO();
        dto.setId(option.getId());
        dto.setOptionText(option.getOptionText());
        dto.setOptionOrder(option.getOptionOrder());
        // Definitely don't send isCorrect to frontend
        dto.setCorrect(null);

        return dto;
    }

    private QuizAttemptDTO convertToAttemptDTO(StudentQuizAttempt attempt) {
        QuizAttemptDTO dto = new QuizAttemptDTO();
        dto.setId(attempt.getId());
        dto.setQuizId(attempt.getQuiz().getId());
        dto.setQuizTitle(attempt.getQuiz().getTitle());
        dto.setStudentUsername(attempt.getStudent().getUsername());
        dto.setScore(attempt.getScore());
        dto.setTotalQuestions(attempt.getTotalQuestions());
        dto.setCorrectAnswers(attempt.getCorrectAnswers());
        dto.setWrongAnswers(attempt.getWrongAnswers());
        dto.setStatus(attempt.getStatus().name());
        dto.setStartedAt(attempt.getStartedAt());
        dto.setCompletedAt(attempt.getCompletedAt());
        dto.setTimeTaken(attempt.getTimeTaken());

        return dto;
    }

    private String getExplanationForQuestion(QuizQuestion question, String selectedAnswer) {
        // You can implement custom explanation logic here
        // For now, return a simple explanation
        if (question.getCorrectAnswer().equals(selectedAnswer)) {
            return "Great job! You selected the correct answer.";
        } else {
            return "The correct answer is: " + question.getCorrectAnswer();
        }
    }
}