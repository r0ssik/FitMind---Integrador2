using FitMind.BackEnd.SystemInfra.Base;

namespace FitMind.BackEnd.SystemInfra.Entities;

public class Meal : BaseEntity
{
    public Guid DietPlanId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public int Calories { get; set; }
    public decimal Proteins { get; set; }
    public decimal Carbs { get; set; }
    public decimal Fats { get; set; }
    public string? Description { get; set; }

    public DietPlan DietPlan { get; set; } = null!;
}
