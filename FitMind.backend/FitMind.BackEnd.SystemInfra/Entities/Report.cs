using FitMind.BackEnd.SystemInfra.Base;

namespace FitMind.BackEnd.SystemInfra.Entities;

public class Report : BaseEntity
{
    public Guid ReporterId { get; set; }
    public string TargetType { get; set; } = string.Empty; // post / user / comment
    public Guid TargetId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "pending"; // pending / resolved / dismissed

    public User Reporter { get; set; } = null!;
}
