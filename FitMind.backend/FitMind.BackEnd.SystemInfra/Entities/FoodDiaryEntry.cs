using FitMind.BackEnd.SystemInfra.Base;

namespace FitMind.BackEnd.SystemInfra.Entities;

public class FoodDiaryEntry : BaseEntity
{
    public Guid UserId { get; set; }
    public DateTime Date { get; set; }
    public string MealType { get; set; } = string.Empty;
    public string FoodName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public int Calories { get; set; }
    public decimal Proteins { get; set; }
    public decimal Carbs { get; set; }
    public decimal Fats { get; set; }

    public User User { get; set; } = null!;
}
