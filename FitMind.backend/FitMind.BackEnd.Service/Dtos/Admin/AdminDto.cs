namespace FitMind.BackEnd.Service.Dtos.Admin;

public record DashboardStatsDto(
    int TotalUsers,
    int ActiveToday,
    int NewThisWeek,
    int WorkoutsToday,
    int ActiveChallenges,
    int OpenReports,
    List<WeeklyActiveDto> WeeklyActivity
);

public record WeeklyActiveDto(string Day, int Count);

public record AdminUserDto(
    Guid Id,
    string Name,
    string Email,
    string Initials,
    DateTime JoinedAt,
    int TotalWorkouts,
    string Status   // active / suspended / blocked
);

public record ReportDto(
    Guid Id,
    string ReporterName,
    string TargetType,
    Guid TargetId,
    string Reason,
    string Status,
    DateTime CreatedAt
);

public record UpdateReportStatusDto(string Status);
