package com.conceptbridge.service;

import com.conceptbridge.dto.AnswerResultDTO;
import com.conceptbridge.dto.AnswerSubmitDTO;
import com.conceptbridge.dto.StudentQuestionDTO;
import com.conceptbridge.dto.StudentQuizDTO;

import java.util.List;

public interface StudentQuizService {
    List<StudentQuestionDTO> getQuestionsForStudent(Long assessmentId, String username);

    List<StudentQuizDTO> getAvailableQuizzes(String username);

    AnswerResultDTO submitAnswer(
            String username,
            Long assessmentId,
            AnswerSubmitDTO dto
    );

}
