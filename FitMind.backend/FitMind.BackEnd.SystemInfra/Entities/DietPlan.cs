using FitMind.BackEnd.SystemInfra.Base;
using FitMind.BackEnd.SystemInfra.Enums;

namespace FitMind.BackEnd.SystemInfra.Entities;

public class DietPlan : BaseEntity
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DietGoal Goal { get; set; }
    public string? Budget { get; set; }
    public string? Restrictions { get; set; }
    public int DailyCalories { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsAiGenerated { get; set; } = false;

    public User User { get; set; } = null!;
    public ICollection<Meal> Meals { get; set; } = [];
}
