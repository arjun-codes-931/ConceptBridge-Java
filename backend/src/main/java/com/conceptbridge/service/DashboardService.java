package com.conceptbridge.service;

import com.conceptbridge.dto.response.DashboardResponse;

public interface DashboardService {
    DashboardResponse getStudentDashboard(Long studentId);
    DashboardResponse getTeacherDashboard(Long teacherId);
    DashboardResponse getAdminDashboard();
}