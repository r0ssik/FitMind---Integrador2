namespace FitMind.BackEnd.Service.Dtos.Settings;

public record UserSettingsDto(
    bool NotifWorkout,
    bool NotifDiet,
    bool NotifWater,
    bool NotifChallenge,
    bool NotifSocial,
    bool NotifAchievement,
    bool PublicProfile,
    bool ShowActivity,
    bool ShowWeight,
    string Theme,
    string Language,
    int CalorieGoal,
    int WaterGoalCups
);

public record UpdateSettingsDto(
    bool? NotifWorkout,
    bool? NotifDiet,
    bool? NotifWater,
    bool? NotifChallenge,
    bool? NotifSocial,
    bool? NotifAchievement,
    bool? PublicProfile,
    bool? ShowActivity,
    bool? ShowWeight,
    string? Theme,
    string? Language,
    int? CalorieGoal,
    int? WaterGoalCups
);
