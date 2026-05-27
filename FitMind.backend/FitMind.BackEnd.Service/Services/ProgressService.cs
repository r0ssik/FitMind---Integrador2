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

        var distinctDates = sessions.Select(s => s.Date.Date).Distinct().ToList();
        int streak     = CalcStreak(distinctDates);
        int bestStreak = CalcBestStreak(distinctDates);

        var settings = await context.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);
        int calorieGoal = settings?.CalorieGoal ?? 2000;

        var weekStart = DateTime.SpecifyKind(now.Date.AddDays(-(int)now.DayOfWeek), DateTimeKind.Utc);
        var weekCalories = await context.FoodDiaryEntries
            .Where(e => e.UserId == userId && e.Date >= weekStart)
            .SumAsync(e => (int?)e.Calories) ?? 0;

        return new ProgressStatsDto(
            currentWeight, startWeight, delta,
            measurements.LastOrDefault()?.BodyFatPercentage,
            totalWorkouts, thisMonth, streak, bestStreak,
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
        var today = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);
        var settings = await context.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);
        int calorieGoal = settings?.CalorieGoal ?? 2000;
        int waterGoal   = settings?.WaterGoalCups ?? 8;

        // Today's workout session
        var todaySession = await context.WorkoutSessions
            .Where(s => s.UserId == userId && s.Date >= today && s.Date < today.AddDays(1))
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync();

        // Active plan's today's day (exercises must be included to count them)
        var activePlan = await context.WorkoutPlans
            .Include(p => p.Days)
                .ThenInclude(d => d.Exercises)
            .FirstOrDefaultAsync(p => p.UserId == userId && p.IsActive);

        string? dayName = null;
        int total = 0, done = 0;
        if (activePlan != null)
        {
            var dayOfWeek = DateTime.UtcNow.DayOfWeek.ToString();

            // 1) Try matching by day-of-week name (e.g. "Segunda", "Monday", "Tuesday")
            var workoutDay = activePlan.Days.FirstOrDefault(d =>
                d.DayName.Contains(dayOfWeek, StringComparison.OrdinalIgnoreCase));

            // 2) Fallback for AI plans that use "Dia 1", "Dia 2" naming:
            //    rotate through plan days based on the current day-of-week (Monday = 0)
            if (workoutDay == null && activePlan.Days.Any())
            {
                var orderedDays = activePlan.Days.OrderBy(d => d.OrderIndex).ToList();
                var dayIndex    = ((int)DateTime.UtcNow.DayOfWeek + 6) % 7; // Mon=0 … Sun=6
                workoutDay      = orderedDays[dayIndex % orderedDays.Count];
            }

            dayName = workoutDay?.Focus ?? workoutDay?.DayName;
            total   = workoutDay?.Exercises.Count ?? 0;

            // Only count the session as "done" when it was specifically for
            // today's planned workout day — prevents stale / wrong-day sessions
            // from polluting the dashboard counter.
            if (todaySession != null && workoutDay != null)
            {
                bool sameDay = !string.IsNullOrEmpty(todaySession.WorkoutDayName) &&
                               todaySession.WorkoutDayName.Equals(
                                   workoutDay.DayName, StringComparison.OrdinalIgnoreCase);

                bool sameFocus = !string.IsNullOrEmpty(todaySession.WorkoutFocus) &&
                                 !string.IsNullOrEmpty(workoutDay.Focus) &&
                                 todaySession.WorkoutFocus.Equals(
                                     workoutDay.Focus, StringComparison.OrdinalIgnoreCase);

                bool samePlan = todaySession.WorkoutPlanId == activePlan.Id;

                done = (samePlan && (sameDay || sameFocus))
                    ? todaySession.ExercisesTotal
                    : 0;
            }
        }

        // Today's calories
        int todayCalories = await context.FoodDiaryEntries
            .Where(e => e.UserId == userId && e.Date >= today && e.Date < today.AddDays(1))
            .SumAsync(e => (int?)e.Calories) ?? 0;

        // Today's water
        var water = await context.WaterIntakes
            .FirstOrDefaultAsync(w => w.UserId == userId && w.Date >= today && w.Date < today.AddDays(1));

        // Weight delta this month

        // Weight delta this month
        var firstOfMonth = DateTime.SpecifyKind(
            new DateTime(today.Year, today.Month, 1),
        DateTimeKind.Utc
        );

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
        var dateUtc = DateTime.SpecifyKind(dto.Date.Date, DateTimeKind.Utc);
        var nextDayUtc = dateUtc.AddDays(1);

        var existing = await context.BodyMeasurements
            .FirstOrDefaultAsync(m => m.UserId == userId && m.Date >= dateUtc && m.Date < nextDayUtc);

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
                Date = dateUtc,
                Weight = dto.Value
            });
            await context.SaveChangesAsync();
        }
    }

    private static int CalcStreak(List<DateTime> distinctDates)
    {
        int streak = 0;
        var day = DateTime.UtcNow.Date;
        var sorted = distinctDates.OrderByDescending(d => d).ToList();
        foreach (var d in sorted)
        {
            if (d == day) { streak++; day = day.AddDays(-1); }
            else if (d < day) break;
        }
        return streak;
    }

    private static int CalcBestStreak(List<DateTime> distinctDates)
    {
        if (distinctDates.Count == 0) return 0;
        var sorted = distinctDates.OrderBy(d => d).ToList();
        int best = 1, current = 1;
        for (int i = 1; i < sorted.Count; i++)
        {
            var diff = (sorted[i] - sorted[i - 1]).Days;
            if (diff == 1)      { current++; if (current > best) best = current; }
            else if (diff > 1)  { current = 1; }
            // diff == 0: duplicate date (already Distinct), skip
        }
        return best;
    }
}
