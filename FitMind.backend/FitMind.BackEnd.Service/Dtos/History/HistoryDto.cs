namespace FitMind.BackEnd.Service.Dtos.History;

public record WorkoutHistoryDto(
    Guid Id,
    DateTime Date,
    string Name,
    string? Focus,
    int DurationMinutes,
    int ExercisesTotal,
    int SetsTotal,
    string? Feeling
);

public record DietHistoryDto(
    DateTime Date,
    int TotalCalories,
    int CalorieGoal,
    decimal TotalProtein,
    decimal TotalCarbs,
    decimal TotalFat
);

public record AchievementHistoryDto(
    Guid Id,
    DateTime UnlockedAt,
    string Icon,
    string Name,
    string Category,
    int Points
);

public record FullHistoryDto(
    List<WorkoutHistoryDto> Workouts,
    List<DietHistoryDto> Diet,
    List<AchievementHistoryDto> Achievements
);
