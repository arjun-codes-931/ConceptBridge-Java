package com.conceptbridge.service.impl;

import com.conceptbridge.dto.*;
import com.conceptbridge.entity.*;
import com.conceptbridge.repository.*;
import com.conceptbridge.service.StudentQuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class StudentQuizServiceImpl implements StudentQuizService {
    @Autowired
    private  AssessmentRepository assessmentRepository;
    @Autowired
    private  QuestionRepository questionRepository;
    @Autowired
    private  StudentRepository studentRepository;
    @Autowired
    private  StudentResponseRepository studentResponseRepository;




    @Override
    public List<StudentQuizDTO> getAvailableQuizzes(String username) {
        Student student = studentRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getTeacher() == null) {
            return new ArrayList<>();
        }

        Long teacherId = student.getTeacher().getId();

        List<Assessment> quizzes = assessmentRepository.findByTeacherIdAndTypeAndIsActiveTrue(
                teacherId, AssessmentType.QUIZ
        );

        return quizzes.stream().map(q -> {
            boolean attempted = studentResponseRepository.existsByStudentIdAndAssessmentId(
                    student.getId(), q.getId());
            String status = attempted ? "SUBMITTED" : "NOT_STARTED";
            return new StudentQuizDTO(q, status);
        }).toList();
    }

    @Override
    public List<StudentQuestionDTO> getQuestionsForStudent(Long assessmentId, String username) {
        Student student = studentRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Assessment assessment = assessmentRepository.findByIdAndIsActiveTrue(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not active or not found"));

        List<Question> questions = questionRepository.findByAssessmentIdOrderByQuestionOrder(assessmentId);

        Set<Long> answeredQuestionIds = studentResponseRepository.findAnsweredQuestionIds(
                student.getId(), assessmentId
        );

        return questions.stream()
                .filter(q -> !answeredQuestionIds.contains(q.getId()))
                .map(StudentQuestionDTO::new)
                .toList();
    }

    @Override
    public AnswerResultDTO submitAnswer(String username, Long assessmentId, AnswerSubmitDTO dto) {
        Student student = studentRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Question question = questionRepository.findById(dto.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (!question.getAssessment().getId().equals(assessmentId)) {
            throw new RuntimeException("Invalid question for this quiz");
        }

        boolean correct = question.getCorrectAnswer().equalsIgnoreCase(dto.getAnswer());

        StudentResponse response = new StudentResponse();
        response.setStudent(student);
        response.setAssessment(question.getAssessment());
        response.setQuestion(question);
        response.setAnswer(dto.getAnswer());
        response.setIsCorrect(correct);
        response.setPointsObtained((double) (correct ? question.getPoints() : 0));
        response.setSubmittedAt(LocalDateTime.now());

        studentResponseRepository.save(response);

        AnswerResultDTO result = new AnswerResultDTO();
        result.setCorrect(correct);
        result.setCorrectAnswer(question.getCorrectAnswer());
        result.setPointsObtained(question.getPoints());

        return result;
    }
}