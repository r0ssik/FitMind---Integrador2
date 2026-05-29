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
    /// <summary>null = aplica a todos os dias; 0=Seg, 1=Ter, ..., 6=Dom</summary>
    public int? DayOfWeek { get; set; }

    public DietPlan DietPlan { get; set; } = null!;
}
