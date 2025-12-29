package com.conceptbridge.repository;

import com.conceptbridge.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    @Query("SELECT s FROM Student s WHERE s.teacher.id = :teacherId")
    List<Student> findByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT s FROM Student s WHERE s.id = :userId")
    Optional<Student> findByUserId(@Param("userId") Long userId);

//    List<Student> findByBranch(String branch);

    Optional<Student> findById(Long id);

//    @Query("SELECT s FROM Student s WHERE s.semester = :semester AND s.branch = :branch")
//    List<Student> findBySemesterAndBranch(@Param("semester") String semester, @Param("branch") String branch);

//    @Query("SELECT s FROM Student s WHERE s.enrollmentNumber = :enrollmentNumber")
//    Optional<Student> findByEnrollmentNumber(@Param("enrollmentNumber") String enrollmentNumber);

//    @Query("SELECT s FROM Student s WHERE s.learningStyle = :learningStyle")
//    List<Student> findByLearningStyle(@Param("learningStyle") String learningStyle);

    Optional<Student> findByUsername(String username);
}