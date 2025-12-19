package com.conceptbridge.dto.response;

import java.util.List;
import java.util.Map;

public class DashboardResponse {
    private Long totalCount;
    private Long activeCount;
    private Double averagePerformance;
    private List<?> recentActivities;
    private Map<String, Long> statistics; // Change from Object to Long
    private List<?> upcomingDeadlines;

    // Constructors
    public DashboardResponse() {}

    public DashboardResponse(Long totalCount, Long activeCount, Double averagePerformance) {
        this.totalCount = totalCount;
        this.activeCount = activeCount;
        this.averagePerformance = averagePerformance;
    }

    // Change parameter type from Map<String, Object> to Map<String, Long>
    public DashboardResponse(Long totalCount, Long activeCount, Double averagePerformance,
                             List<?> recentActivities, Map<String, Long> statistics) {
        this.totalCount = totalCount;
        this.activeCount = activeCount;
        this.averagePerformance = averagePerformance;
        this.recentActivities = recentActivities;
        this.statistics = statistics;
    }

    // Alternative constructor
    public DashboardResponse(Long totalCount, Long activeCount, Double averagePerformance,
                             List<?> recentActivities, List<?> upcomingDeadlines) {
        this.totalCount = totalCount;
        this.activeCount = activeCount;
        this.averagePerformance = averagePerformance;
        this.recentActivities = recentActivities;
        this.upcomingDeadlines = upcomingDeadlines;
    }

    // Getters and Setters
    public Long getTotalCount() { return totalCount; }
    public void setTotalCount(Long totalCount) { this.totalCount = totalCount; }

    public Long getActiveCount() { return activeCount; }
    public void setActiveCount(Long activeCount) { this.activeCount = activeCount; }

    public Double getAveragePerformance() { return averagePerformance; }
    public void setAveragePerformance(Double averagePerformance) { this.averagePerformance = averagePerformance; }

    public List<?> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<?> recentActivities) { this.recentActivities = recentActivities; }

    public Map<String, Long> getStatistics() { return statistics; }
    public void setStatistics(Map<String, Long> statistics) { this.statistics = statistics; }

    public List<?> getUpcomingDeadlines() { return upcomingDeadlines; }
    public void setUpcomingDeadlines(List<?> upcomingDeadlines) { this.upcomingDeadlines = upcomingDeadlines; }
}