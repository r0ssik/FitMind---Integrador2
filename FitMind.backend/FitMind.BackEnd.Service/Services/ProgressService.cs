using FitMind.BackEnd.Service.Dtos.Progress;
using FitMind.BackEnd.Service.Interfaces;
using FitMind.BackEnd.SystemInfra.ContextDb;
using FitMind.BackEnd.SystemInfra.Entities;
using Microsoft.EntityFrameworkCore;

namespace FitMind.BackEnd.Service.Services;

public class ProgressService(AppDbContext context) : IProgressService
{
    public async Task<ProgressStatsDto> GetStatsAsync(Guid userId)
    {
        var now = DateTime.UtcNow;

        var measurements = await context.BodyMeasurements
            .Where(m => m.UserId == userId && m.Weight.HasValue)
            .OrderBy(m => m.Date)
            .ToListAsync();

        decimal? currentWeight = measurements.LastOrDefault()?.Weight;
        decimal? startWeight   = measurements.FirstOrDefault()?.Weight;
        decimal? delta = (currentWeight.HasValue && startWeight.HasValue)
            ? currentWeight - startWeight : null;

        var sessions = await context.WorkoutSessions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.Date)
            .ToListAsync();

        int totalWorkouts = sessions.Count;
        int thisMonth = sessions.Count(s => s.Date.Month == now.Month && s.Date.Year == now.Year);
        double avgMin = sessions.Count > 0 ? sessions.Average(s => s.DurationMinutes) : 0;

        int streak = CalcStreak(sessions.Select(s => s.Date.Date).Distinct().ToList());

        var settings = await context.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);
        int calorieGoal = settings?.CalorieGoal ?? 2000;

        var weekStart = now.Date.AddDays(-(int)now.DayOfWeek);
        var weekCalories = await context.FoodDiaryEntries
            .Where(e => e.UserId == userId && e.Date >= weekStart)
            .SumAsync(e => (int?)e.Calories) ?? 0;

        return new ProgressStatsDto(
            currentWeight, startWeight, delta,
            measurements.LastOrDefault()?.BodyFatPercentage,
            totalWorkouts, thisMonth, streak, streak,
            Math.Round(avgMin, 0), weekCalories, calorieGoal);
    }

    public async Task<ChartDataDto> GetChartDataAsync(Guid userId, string period)
    {
        var since = period switch
        {
            "7d"  => DateTime.UtcNow.AddDays(-7),
            "3m"  => DateTime.UtcNow.AddMonths(-3),
            _     => DateTime.UtcNow.AddDays(-30)
        };

        var weights = await context.BodyMeasurements
            .Where(m => m.UserId == userId && m.Weight.HasValue && m.Date >= since)
            .OrderBy(m => m.Date)
            .Select(m => new WeightEntryDto(m.Date, m.Weight!.Value))
            .ToListAsync();

        var meas = await context.BodyMeasurements
            .Where(m => m.UserId == userId && m.Date >= since)
            .OrderBy(m => m.Date)
            .Select(m => new MeasurementChartDto(m.Date, m.Waist, m.Hip, m.Chest))
            .ToListAsync();

        var sessions = await context.WorkoutSessions
            .Where(s => s.UserId == userId && s.Date >= since)
            .OrderBy(s => s.Date)
            .ToListAsync();

        var bars = sessions.Select(s => new WorkoutBarDto(
            s.Date.ToString("dd/MM"), s.DurationMinutes, s.ExercisesTotal)).ToList();

        return new ChartDataDto(weights, meas, bars);
    }

    public async Task<DashboardProgressDto> GetDashboardAsync(Guid userId)
    {
        var today = DateTime.UtcNow.Date;
        var settings = await context.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);
        int calorieGoal = settings?.CalorieGoal ?? 2000;
        int waterGoal   = settings?.WaterGoalCups ?? 8;

        // Today's workout session
        var todaySession = await context.WorkoutSessions
            .Where(s => s.UserId == userId && s.Date.Date == today)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync();

        // Active plan's today's day
        var activePlan = await context.WorkoutPlans
            .Include(p => p.Days)
            .FirstOrDefaultAsync(p => p.UserId == userId && p.IsActive);

        string? dayName = null;
        int total = 0, done = 0;
        if (activePlan != null)
        {
            var dayOfWeek = DateTime.UtcNow.DayOfWeek.ToString();
            var workoutDay = activePlan.Days.FirstOrDefault(d =>
                d.DayName.Contains(dayOfWeek, StringComparison.OrdinalIgnoreCase));
            dayName = workoutDay?.Focus;
            total = workoutDay?.Exercises.Count ?? 0;
        }

        // Today's calories
        int todayCalories = await context.FoodDiaryEntries
            .Where(e => e.UserId == userId && e.Date.Date == today)
            .SumAsync(e => (int?)e.Calories) ?? 0;

        // Today's water
        var water = await context.WaterIntakes
            .FirstOrDefaultAsync(w => w.UserId == userId && w.Date.Date == today);

        // Weight delta this month
        var firstOfMonth = new DateTime(today.Year, today.Month, 1);
        var monthMeas = await context.BodyMeasurements
            .Where(m => m.UserId == userId && m.Weight.HasValue && m.Date >= firstOfMonth)
            .OrderBy(m => m.Date)
            .ToListAsync();

        decimal? weightDelta = null;
        if (monthMeas.Count >= 2)
            weightDelta = monthMeas.Last().Weight - monthMeas.First().Weight;

        return new DashboardProgressDto(
            dayName, done, total,
            todayCalories, calorieGoal,
            water?.Cups ?? 0, waterGoal,
            weightDelta);
    }

    public async Task AddWeightEntryAsync(Guid userId, AddWeightDto dto)
    {
        var existing = await context.BodyMeasurements
            .FirstOrDefaultAsync(m => m.UserId == userId && m.Date.Date == dto.Date.Date);

        if (existing is not null)
        {
            existing.Weight = dto.Value;
            await context.SaveChangesAsync();
        }
        else
        {
            await context.BodyMeasurements.AddAsync(new BodyMeasurement
            {
                UserId = userId,
                Date = dto.Date.Date,
                Weight = dto.Value
            });
            await context.SaveChangesAsync();
        }
    }

    private static int CalcStreak(List<DateTime> dates)
    {
        int streak = 0;
        var day = DateTime.UtcNow.Date;
        var sorted = dates.OrderByDescending(d => d).ToList();
        foreach (var d in sorted)
        {
            if (d == day) { streak++; day = day.AddDays(-1); }
            else if (d < day) break;
        }
        return streak;
    }
}
