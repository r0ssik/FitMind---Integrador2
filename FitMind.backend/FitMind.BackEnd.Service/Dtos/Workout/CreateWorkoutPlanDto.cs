using FitMind.BackEnd.SystemInfra.Enums;

namespace FitMind.BackEnd.Service.Dtos.Workout;

public record CreateWorkoutPlanDto(
    string Name,
    WorkoutGoal Goal,
    int DaysPerWeek,
    int Weeks,
    string? ExperienceLevel,
    string? Location,
    List<CreateWorkoutDayDto>? Days   // days + exercises from the AI plan
);

public record CreateWorkoutDayDto(
    string DayName,
    string Focus,
    int OrderIndex,
    List<CreateExerciseDto> Exercises
);

public record CreateExerciseDto(
    string Name,
    int Sets,
    string Reps,
    string RestTime,
    int EffortLevel,
    string? Tips,
    int OrderIndex
);

public record LogWorkoutSessionDto(
    Guid? WorkoutPlanId,
    DateTime Date,
    int DurationMinutes,
    string? Feeling,
    string? Notes,
    string? WorkoutDayName,
    string? WorkoutFocus,
    int ExercisesTotal,
    int SetsTotal
);
