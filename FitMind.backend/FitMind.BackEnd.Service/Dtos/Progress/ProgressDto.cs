namespace FitMind.BackEnd.Service.Dtos.Progress;

public record WeightEntryDto(DateTime Date, decimal Value);

public record ProgressStatsDto(
    decimal? CurrentWeight,
    decimal? StartWeight,
    decimal? WeightDelta,
    decimal? CurrentBodyFat,
    int TotalWorkouts,
    int WorkoutsThisMonth,
    int CurrentStreak,
    int BestStreak,
    double AvgWorkoutMinutes,
    int TotalCaloriesThisWeek,
    int CalorieGoal
);

public record ChartDataDto(
    List<WeightEntryDto> WeightHistory,
    List<MeasurementChartDto> MeasurementHistory,
    List<WorkoutBarDto> WorkoutBars
);

public record MeasurementChartDto(DateTime Date, decimal? Waist, decimal? Hip, decimal? Chest);
public record WorkoutBarDto(string Label, int DurationMinutes, int Exercises);

public record DashboardProgressDto(
    string? TodayWorkoutName,
    int TodayWorkoutDone,
    int TodayWorkoutTotal,
    int TodayCalories,
    int CalorieGoal,
    int WaterCups,
    int WaterGoal,
    decimal? WeightDeltaThisMonth
);

public record AddWeightDto(DateTime Date, decimal Value);
