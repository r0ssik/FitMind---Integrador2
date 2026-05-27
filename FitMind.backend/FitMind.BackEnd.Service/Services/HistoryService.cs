using FitMind.BackEnd.Service.Dtos.History;
using FitMind.BackEnd.Service.Interfaces;
using FitMind.BackEnd.SystemInfra.ContextDb;
using Microsoft.EntityFrameworkCore;

namespace FitMind.BackEnd.Service.Services;

public class HistoryService(AppDbContext context) : IHistoryService
{
    public async Task<FullHistoryDto> GetFullHistoryAsync(Guid userId)
    {
        var workouts    = await GetWorkoutHistoryAsync(userId, null);
        var diet        = await GetDietHistoryAsync(userId, 30);
        var achievements = await GetAchievementHistoryAsync(userId);

        return new FullHistoryDto(
            workouts.ToList(),
            diet.ToList(),
            achievements.ToList());
    }

    public async Task<IEnumerable<WorkoutHistoryDto>> GetWorkoutHistoryAsync(Guid userId, string? filter)
    {
        var query = context.WorkoutSessions
            .Where(s => s.UserId == userId);

        if (!string.IsNullOrWhiteSpace(filter) && filter != "all")
            query = query.Where(s => s.WorkoutFocus != null &&
                                     s.WorkoutFocus.ToLower().Contains(filter.ToLower()));

        return (await query.OrderByDescending(s => s.Date).ToListAsync())
            .Select(s => new WorkoutHistoryDto(
                s.Id, s.Date,
                s.WorkoutDayName ?? "Treino",
                s.WorkoutFocus,
                s.DurationMinutes,
                s.ExercisesTotal,
                s.SetsTotal,
                s.Feeling));
    }

    public async Task<IEnumerable<DietHistoryDto>> GetDietHistoryAsync(Guid userId, int days = 30)
    {
        var since = DateTime.SpecifyKind(DateTime.UtcNow.Date.AddDays(-days), DateTimeKind.Utc);
        var settings = await context.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);
        int calorieGoal = settings?.CalorieGoal ?? 2000;

        // Traz as linhas brutas e agrupa em memória — EF Core não traduz
        // GroupBy+Select com variável externa (calorieGoal) para SQL.
        var raw = await context.FoodDiaryEntries
            .Where(e => e.UserId == userId && e.Date >= since)
            .ToListAsync();

        return raw
            .GroupBy(e => e.Date.Date)
            .Select(g => new DietHistoryDto(
                g.Key,
                g.Sum(e => e.Calories),
                calorieGoal,
                g.Sum(e => e.Proteins),
                g.Sum(e => e.Carbs),
                g.Sum(e => e.Fats)))
            .OrderByDescending(d => d.Date)
            .ToList();
    }

    private async Task<IEnumerable<AchievementHistoryDto>> GetAchievementHistoryAsync(Guid userId)
    {
        return await context.UserAchievements
            .Include(ua => ua.Achievement)
            .Where(ua => ua.UserId == userId)
            .OrderByDescending(ua => ua.UnlockedAt)
            .Select(ua => new AchievementHistoryDto(
                ua.AchievementId,
                ua.UnlockedAt,
                ua.Achievement.Icon,
                ua.Achievement.Name,
                ua.Achievement.Category,
                ua.Achievement.Points))
            .ToListAsync();
    }
}
