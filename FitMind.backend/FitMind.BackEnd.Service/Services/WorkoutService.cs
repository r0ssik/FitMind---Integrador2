using FitMind.BackEnd.Service.Dtos.Workout;
using FitMind.BackEnd.Service.Interfaces;
using FitMind.BackEnd.SystemInfra.ContextDb;
using FitMind.BackEnd.SystemInfra.Entities;
using Microsoft.EntityFrameworkCore;

namespace FitMind.BackEnd.Service.Services;

public class WorkoutService(AppDbContext context) : IWorkoutService
{
    public async Task<WorkoutPlanDto?> GetActivePlanAsync(Guid userId)
    {
        var plan = await context.WorkoutPlans
            .Include(p => p.Days.OrderBy(d => d.OrderIndex))
                .ThenInclude(d => d.Exercises.OrderBy(e => e.OrderIndex))
            .FirstOrDefaultAsync(p => p.UserId == userId && p.IsActive);

        return plan is null ? null : MapToDto(plan);
    }

    public async Task<IEnumerable<WorkoutPlanDto>> GetHistoryAsync(Guid userId)
    {
        var plans = await context.WorkoutPlans
            .Include(p => p.Days.OrderBy(d => d.OrderIndex))
                .ThenInclude(d => d.Exercises.OrderBy(e => e.OrderIndex))
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return plans.Select(MapToDto);
    }

    public async Task<WorkoutPlanDto> CreatePlanAsync(Guid userId, CreateWorkoutPlanDto dto)
    {
        // Deactivate current plan
        await context.WorkoutPlans
            .Where(p => p.UserId == userId && p.IsActive)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsActive, false));

        var plan = new WorkoutPlan
        {
            UserId = userId,
            Name = dto.Name,
            Goal = dto.Goal,
            DaysPerWeek = dto.DaysPerWeek,
            Weeks = dto.Weeks,
            IsActive = true,
            IsAiGenerated = false
        };

        await context.WorkoutPlans.AddAsync(plan);
        await context.SaveChangesAsync();

        return MapToDto(plan);
    }

    public async Task SetActivePlanAsync(Guid userId, Guid planId)
    {
        await context.WorkoutPlans
            .Where(p => p.UserId == userId && p.IsActive)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsActive, false));

        await context.WorkoutPlans
            .Where(p => p.Id == planId && p.UserId == userId)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsActive, true));
    }

    public async Task LogSessionAsync(Guid userId, LogWorkoutSessionDto dto)
    {
        var session = new WorkoutSession
        {
            UserId = userId,
            WorkoutPlanId = dto.WorkoutPlanId,
            Date = dto.Date,
            DurationMinutes = dto.DurationMinutes,
            Feeling = dto.Feeling,
            Notes = dto.Notes
        };

        await context.WorkoutSessions.AddAsync(session);
        await context.SaveChangesAsync();
    }

    private static WorkoutPlanDto MapToDto(WorkoutPlan p) => new(
        p.Id, p.Name, p.Goal, p.DaysPerWeek, p.Weeks, p.IsAiGenerated, p.CreatedAt,
        p.Days.Select(d => new WorkoutDayDto(
            d.Id, d.DayName, d.Focus, d.OrderIndex,
            d.Exercises.Select(e => new ExerciseDto(
                e.Id, e.Name, e.Sets, e.Reps, e.RestTime, e.EffortLevel, e.Tips
            )).ToList()
        )).ToList()
    );
}
