using FitMind.BackEnd.SystemInfra.Base;

namespace FitMind.BackEnd.SystemInfra.Entities;

public class UserSettings : BaseEntity
{
    public Guid UserId { get; set; }

    // Notifications
    public bool NotifWorkout { get; set; } = true;
    public bool NotifDiet { get; set; } = true;
    public bool NotifWater { get; set; } = true;
    public bool NotifChallenge { get; set; } = true;
    public bool NotifSocial { get; set; } = true;
    public bool NotifAchievement { get; set; } = true;

    // Privacy
    public bool PublicProfile { get; set; } = true;
    public bool ShowActivity { get; set; } = true;
    public bool ShowWeight { get; set; } = false;

    // Preferences
    public string Theme { get; set; } = "system";  // light / dark / system
    public string Language { get; set; } = "pt";

    // Goals
    public int CalorieGoal { get; set; } = 2000;
    public int WaterGoalCups { get; set; } = 8;

    public User User { get; set; } = null!;
}
