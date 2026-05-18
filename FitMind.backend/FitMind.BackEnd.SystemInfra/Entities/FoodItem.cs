using FitMind.BackEnd.SystemInfra.Base;

namespace FitMind.BackEnd.SystemInfra.Entities;

public class FoodItem : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public int CaloriesPer100g { get; set; }
    public decimal ProteinPer100g { get; set; }
    public decimal CarbsPer100g { get; set; }
    public decimal FatsPer100g { get; set; }
    /// <summary>JSON array of { label, grams }</summary>
    public string? CommonPortions { get; set; }
}
