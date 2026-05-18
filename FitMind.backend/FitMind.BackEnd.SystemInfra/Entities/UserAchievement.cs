using FitMind.BackEnd.SystemInfra.Base;

namespace FitMind.BackEnd.SystemInfra.Entities;

public class UserAchievement : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid AchievementId { get; set; }
    public DateTime UnlockedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Achievement Achievement { get; set; } = null!;
}
