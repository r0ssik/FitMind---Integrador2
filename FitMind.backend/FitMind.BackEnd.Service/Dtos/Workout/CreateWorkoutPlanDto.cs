using FitMind.BackEnd.SystemInfra.Enums;

namespace FitMind.BackEnd.Service.Dtos.Workout;

public record CreateWorkoutPlanDto(
    string Name,
    WorkoutGoal Goal,
    int DaysPerWeek,
    int Weeks,
    string? ExperienceLevel,
    string? Location
);

public record LogWorkoutSessionDto(
    Guid? WorkoutPlanId,
    DateTime Date,
    int DurationMinutes,
    string? Feeling,
    string? Notes
);
