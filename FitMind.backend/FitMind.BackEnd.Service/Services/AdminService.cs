using FitMind.BackEnd.Service.Dtos.Admin;
using FitMind.BackEnd.Service.Interfaces;
using FitMind.BackEnd.SystemInfra.ContextDb;
using Microsoft.EntityFrameworkCore;

namespace FitMind.BackEnd.Service.Services;

public class AdminService(AppDbContext context) : IAdminService
{
    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var now = DateTime.UtcNow;
        var todayStart = now.Date;
        var weekStart = todayStart.AddDays(-6);

        var totalUsers = await context.Users.CountAsync(u => !u.IsAdmin);
        var workoutsToday = await context.WorkoutSessions.CountAsync(s => s.Date >= todayStart);
        var activeChallenges = await context.Challenges.CountAsync(c => c.EndDate >= now);
        var openReports = await context.Reports.CountAsync(r => r.Status == "pending");
        var newThisWeek = await context.Users.CountAsync(u => !u.IsAdmin && u.CreatedAt >= weekStart);

        // Active today: users who logged a workout session today
        var activeToday = await context.WorkoutSessions
            .Where(s => s.Date >= todayStart)
            .Select(s => s.UserId)
            .Distinct()
            .CountAsync();

        // Weekly activity: count sessions per day over last 7 days
        var sessions = await context.WorkoutSessions
            .Where(s => s.Date >= weekStart)
            .Select(s => s.Date.Date)
            .ToListAsync();

        var weeklyActivity = Enumerable.Range(0, 7)
            .Select(i =>
            {
                var day = weekStart.AddDays(i);
                return new WeeklyActiveDto(
                    day.ToString("ddd"),
                    sessions.Count(d => d == day));
            })
            .ToList();

        return new DashboardStatsDto(
            totalUsers,
            activeToday,
            newThisWeek,
            workoutsToday,
            activeChallenges,
            openReports,
            weeklyActivity);
    }

    public async Task<IEnumerable<AdminUserDto>> GetUsersAsync(string? search, string? status)
    {
        var query = context.Users
            .Where(u => !u.IsAdmin)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(u =>
                u.Name.ToLower().Contains(s) ||
                u.Email.ToLower().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = status switch
            {
                "active"    => query.Where(u => u.IsActive && !u.IsSuspended),
                "suspended" => query.Where(u => u.IsSuspended),
                "blocked"   => query.Where(u => !u.IsActive),
                _           => query
            };
        }

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        var userIds = users.Select(u => u.Id).ToList();
        var workoutCounts = await context.WorkoutSessions
            .Where(s => userIds.Contains(s.UserId))
            .GroupBy(s => s.UserId)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Key, x => x.Count);

        return users.Select(u =>
        {
            var userStatus = !u.IsActive ? "blocked"
                           : u.IsSuspended ? "suspended"
                           : "active";

            return new AdminUserDto(
                u.Id,
                u.Name,
                u.Email,
                Initials(u.Name),
                u.CreatedAt,
                workoutCounts.GetValueOrDefault(u.Id, 0),
                userStatus);
        });
    }

    public async Task SuspendUserAsync(Guid userId)
    {
        var user = await context.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");
        user.IsSuspended = true;
        await context.SaveChangesAsync();
    }

    public async Task BlockUserAsync(Guid userId)
    {
        var user = await context.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");
        user.IsActive = false;
        await context.SaveChangesAsync();
    }

    public async Task ReactivateUserAsync(Guid userId)
    {
        var user = await context.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");
        user.IsActive = true;
        user.IsSuspended = false;
        await context.SaveChangesAsync();
    }

    public async Task<IEnumerable<ReportDto>> GetReportsAsync(string? status)
    {
        var query = context.Reports
            .Include(r => r.Reporter)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(r => r.Status == status);

        var reports = await query
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reports.Select(r => new ReportDto(
            r.Id,
            r.Reporter?.Name ?? "Desconhecido",
            r.TargetType,
            r.TargetId,
            r.Reason,
            r.Status,
            r.CreatedAt));
    }

    public async Task UpdateReportStatusAsync(Guid reportId, UpdateReportStatusDto dto)
    {
        var report = await context.Reports.FindAsync(reportId)
            ?? throw new KeyNotFoundException("Denúncia não encontrada.");
        report.Status = dto.Status;
        await context.SaveChangesAsync();
    }

    private static string Initials(string name)
    {
        var parts = name.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return parts.Length >= 2
            ? $"{parts[0][0]}{parts[^1][0]}".ToUpper()
            : name[..Math.Min(2, name.Length)].ToUpper();
    }
}
