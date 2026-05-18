using FitMind.BackEnd.SystemInfra.Enums;

namespace FitMind.BackEnd.Service.Dtos.Workout;

public record WorkoutPlanDto(
    Guid Id,
    string Name,
    WorkoutGoal Goal,
    int DaysPerWeek,
    int Weeks,
    bool IsAiGenerated,
    DateTime CreatedAt,
    List<WorkoutDayDto> Days
);

public record WorkoutDayDto(
    Guid Id,
    string DayName,
    string Focus,
    int OrderIndex,
    List<ExerciseDto> Exercises
);

public record ExerciseDto(
    Guid Id,
    string Name,
    int Sets,
    string Reps,
    string RestTime,
    int EffortLevel,
    string? Tips
);
