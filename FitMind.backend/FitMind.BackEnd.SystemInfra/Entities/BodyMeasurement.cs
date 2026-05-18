using FitMind.BackEnd.SystemInfra.Base;

namespace FitMind.BackEnd.SystemInfra.Entities;

public class BodyMeasurement : BaseEntity
{
    public Guid UserId { get; set; }
    public DateTime Date { get; set; }
    public decimal? Weight { get; set; }
    public decimal? BodyFatPercentage { get; set; }
    public decimal? MuscleMassPercentage { get; set; }
    public decimal? Arm { get; set; }
    public decimal? Waist { get; set; }
    public decimal? Hip { get; set; }
    public decimal? Thigh { get; set; }
    public decimal? Chest { get; set; }
    public string? Notes { get; set; }

    public User User { get; set; } = null!;
}
