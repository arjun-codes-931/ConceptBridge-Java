package com.conceptbridge.service.impl;

import com.conceptbridge.entity.Assessment;
import com.conceptbridge.entity.Question;
import com.conceptbridge.entity.StudentResponse;
import com.conceptbridge.repository.AssessmentRepository;
import com.conceptbridge.repository.QuestionRepository;
import com.conceptbridge.repository.ResponseRepository;
import com.conceptbridge.service.AssessmentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AssessmentServiceImpl implements AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final QuestionRepository questionRepository;
    private final ResponseRepository responseRepository;

    public AssessmentServiceImpl(AssessmentRepository assessmentRepository,
                                 QuestionRepository questionRepository,
                                 ResponseRepository responseRepository) {
        this.assessmentRepository = assessmentRepository;
        this.questionRepository = questionRepository;
        this.responseRepository = responseRepository;
    }

//    @Override
//    public Assessment createAssessment(Assessment assessment) {
//        return assessmentRepository.save(assessment);
//    }
//
//    @Override
//    public List<Assessment> getAssessmentsByTeacher(Long teacherId) {
//        return assessmentRepository.findByTeacherId(teacherId);
//    }
//
//    @Override
//    public List<StudentResponse> getAssessmentResponses(Long assessmentId) {
//        return responseRepository.findByAssessmentId(assessmentId);
//    }
//
//    @Override
//    public Question addQuestionToAssessment(Long assessmentId, Question question) {
//        Assessment assessment = assessmentRepository.findById(assessmentId)
//                .orElseThrow(() -> new RuntimeException("Assessment not found with id: " + assessmentId));
//
//        question.setAssessment(assessment);
//        return questionRepository.save(question);
//    }
//
//    @Override
//    public Assessment updateAssessmentStatus(Long assessmentId, Boolean isActive) {
//        Assessment assessment = assessmentRepository.findById(assessmentId)
//                .orElseThrow(() -> new RuntimeException("Assessment not found with id: " + assessmentId));
//
//        assessment.setIsActive(isActive);
//        return assessmentRepository.save(assessment);
//    }
//
//    @Override
//    public Double calculateAssessmentStatistics(Long assessmentId) {
//        Long totalResponses = responseRepository.countResponsesByAssessmentId(assessmentId);
//        Long correctResponses = responseRepository.countCorrectResponsesByAssessmentId(assessmentId);
//
//        if (totalResponses == 0) {
//            return 0.0;
//        }
//
//        return (correctResponses.doubleValue() / totalResponses.doubleValue()) * 100.0;
//    }
}