package com.conceptbridge.service;

import com.conceptbridge.dto.QuestionDTO.StudentQuizDTO;

import java.util.List;

public interface StudentQuizService {
//    List<StudentQuestionDTO> getQuestionsForStudent(Long assessmentId, String username);

    List<StudentQuizDTO> getAvailableQuizzes(String username);

//    AnswerResultDTO submitAnswer(
//            String username,
//            Long assessmentId,
//            AnswerSubmitDTO dto
//    );

}
