using FitMind.BackEnd.SystemInfra.Base;
using FitMind.BackEnd.SystemInfra.Enums;

namespace FitMind.BackEnd.SystemInfra.Entities;

public class User : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public UserSex Sex { get; set; }
    public decimal Weight { get; set; }
    public decimal Height { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Limitations { get; set; }
    public string? Goals { get; set; }  // JSON array of goal strings
    public bool IsAdmin { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public bool IsSuspended { get; set; } = false;

    // Navigation
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
    public ICollection<WorkoutPlan> WorkoutPlans { get; set; } = [];
    public ICollection<DietPlan> DietPlans { get; set; } = [];
    public ICollection<WorkoutSession> WorkoutSessions { get; set; } = [];
    public ICollection<FoodDiaryEntry> FoodDiaryEntries { get; set; } = [];
    public ICollection<BodyMeasurement> BodyMeasurements { get; set; } = [];
    public ICollection<Post> Posts { get; set; } = [];
    public ICollection<PostLike> PostLikes { get; set; } = [];
    public ICollection<Comment> Comments { get; set; } = [];
    public ICollection<UserAchievement> UserAchievements { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
    public ICollection<ChallengeParticipant> ChallengeParticipants { get; set; } = [];
    public ICollection<Follow> Followers { get; set; } = [];
    public ICollection<Follow> Following { get; set; } = [];
    public ICollection<WaterIntake> WaterIntakes { get; set; } = [];
    public UserSettings? Settings { get; set; }
    public ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = [];
    public ICollection<Report> Reports { get; set; } = [];
}
