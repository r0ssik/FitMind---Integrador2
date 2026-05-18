using FitMind.BackEnd.SystemInfra.Base;

namespace FitMind.BackEnd.SystemInfra.Entities;

public class Achievement : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public int Points { get; set; }

    public ICollection<UserAchievement> UserAchievements { get; set; } = [];
}
