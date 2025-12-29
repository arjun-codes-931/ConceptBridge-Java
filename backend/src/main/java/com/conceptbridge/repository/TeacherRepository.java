package com.conceptbridge.repository;

import com.conceptbridge.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
//    @Query("SELECT t FROM Teacher t WHERE t.id IN :teacherIds")
//    List<Teacher> findByIdIn(@Param("teacherIds") List<Long> teacherIds);

    @Query("SELECT t FROM Teacher t WHERE t.id = :userId")
    Optional<Teacher> findByUserId(@Param("userId") Long userId);

//    List<Teacher> findByDepartment(String department);

    Optional<Teacher> findById(Long id);


//    @Query("SELECT t FROM Teacher t WHERE t.specialization LIKE %:specialization%")
//    List<Teacher> findBySpecializationContaining(@Param("specialization") String specialization);
}