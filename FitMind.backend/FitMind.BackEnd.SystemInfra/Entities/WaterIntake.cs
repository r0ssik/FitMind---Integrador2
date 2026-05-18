using FitMind.BackEnd.SystemInfra.Base;

namespace FitMind.BackEnd.SystemInfra.Entities;

public class WaterIntake : BaseEntity
{
    public Guid UserId { get; set; }
    public DateTime Date { get; set; }
    public int Cups { get; set; } // each cup = 250ml

    public User User { get; set; } = null!;
}
