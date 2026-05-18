using FitMind.BackEnd.Service.Dtos.Achievement;
using FitMind.BackEnd.Service.Interfaces;
using FitMind.BackEnd.SystemInfra.ContextDb;
using FitMind.BackEnd.SystemInfra.Entities;
using FitMind.BackEnd.SystemInfra.Enums;
using Microsoft.EntityFrameworkCore;

namespace FitMind.BackEnd.Service.Services;

public class AchievementService(AppDbContext context) : IAchievementService
{
    public async Task<IEnumerable<AchievementDto>> GetAllForUserAsync(Guid userId)
    {
        var all = await context.Achievements.ToListAsync();
        var unlocked = await context.UserAchievements
            .Where(ua => ua.UserId == userId)
            .ToListAsync();

        var stats = await BuildStatsAsync(userId);

        return all.Select(a =>
        {
            var ua = unlocked.FirstOrDefault(u => u.AchievementId == a.Id);
            var progress = ua is null ? CalcProgress(a, stats) : (int?)null;
            return new AchievementDto(
                a.Id, a.Name, a.Description, a.Category, a.Icon, a.Points,
                ua is not null, ua?.UnlockedAt, progress);
        });
    }

    public async Task CheckAndUnlockAsync(Guid userId)
    {
        var all = await context.Achievements.ToListAsync();
        var alreadyUnlocked = await context.UserAchievements
            .Where(ua => ua.UserId == userId)
            .Select(ua => ua.AchievementId)
            .ToListAsync();

        var stats = await BuildStatsAsync(userId);
        var toUnlock = new List<UserAchievement>();

        foreach (var a in all.Where(a => !alreadyUnlocked.Contains(a.Id)))
        {
            if (IsConditionMet(a.Condition, stats))
                toUnlock.Add(new UserAchievement { UserId = userId, AchievementId = a.Id, UnlockedAt = DateTime.UtcNow });
        }

        if (toUnlock.Count > 0)
        {
            await context.UserAchievements.AddRangeAsync(toUnlock);
            await context.SaveChangesAsync();

            // Create notifications for unlocked achievements
            foreach (var ua in toUnlock)
            {
                var ach = all.First(a => a.Id == ua.AchievementId);
                await context.Notifications.AddAsync(new Notification
                {
                    UserId = userId,
                    Type = NotificationType.Achievement,
                    Title = "Conquista desbloqueada!",
                    Body = $"Você desbloqueou: {ach.Name}"
                });
            }
            await context.SaveChangesAsync();
        }
    }

    // ── Private helpers ───────────────────────────────────────
    private async Task<UserStats> BuildStatsAsync(Guid userId)
    {
        var now = DateTime.UtcNow;
        var totalWorkouts = await context.WorkoutSessions.CountAsync(s => s.UserId == userId);

        var sessions = await context.WorkoutSessions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.Date)
            .Select(s => s.Date.Date)
            .ToListAsync();

        int streak = 0;
        var day = now.Date;
        foreach (var _ in sessions.Distinct())
        {
            if (sessions.Contains(day)) { streak++; day = day.AddDays(-1); }
            else break;
        }

        var challenges = await context.ChallengeParticipants.CountAsync(p => p.UserId == userId);
        var maxDuration = await context.WorkoutSessions
            .Where(s => s.UserId == userId)
            .Select(s => s.DurationMinutes).DefaultIfEmpty(0).MaxAsync();

        var earlyWorkout = await context.WorkoutSessions
            .AnyAsync(s => s.UserId == userId && s.Date.Hour < 7);

        return new UserStats(totalWorkouts, streak, challenges, maxDuration, earlyWorkout);
    }

    private static bool IsConditionMet(string condition, UserStats s) => condition switch
    {
        "workouts>=1"   => s.TotalWorkouts >= 1,
        "workouts>=10"  => s.TotalWorkouts >= 10,
        "workouts>=50"  => s.TotalWorkouts >= 50,
        "workouts>=100" => s.TotalWorkouts >= 100,
        "duration>=90"  => s.MaxDurationMinutes >= 90,
        "before_7am"    => s.HasEarlyWorkout,
        "streak>=7"     => s.CurrentStreak >= 7,
        "streak>=30"    => s.CurrentStreak >= 30,
        "streak>=60"    => s.CurrentStreak >= 60,
        "challenges>=1" => s.TotalChallenges >= 1,
        "challenges>=5" => s.TotalChallenges >= 5,
        _ => false
    };

    private static int CalcProgress(Achievement a, UserStats s)
    {
        try
        {
            var parts = a.Condition.Split(">=");
            if (parts.Length != 2) return 0;
            int target = int.Parse(parts[1]);
            int current = parts[0] switch
            {
                "workouts"   => s.TotalWorkouts,
                "streak"     => s.CurrentStreak,
                "challenges" => s.TotalChallenges,
                "duration"   => s.MaxDurationMinutes,
                _ => 0
            };
            return (int)Math.Min(100, current * 100.0 / target);
        }
        catch { return 0; }
    }

    private record UserStats(
        int TotalWorkouts,
        int CurrentStreak,
        int TotalChallenges,
        int MaxDurationMinutes,
        bool HasEarlyWorkout);
}
