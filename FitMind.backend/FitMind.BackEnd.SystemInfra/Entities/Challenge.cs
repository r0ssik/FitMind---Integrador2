using FitMind.BackEnd.SystemInfra.Base;
using FitMind.BackEnd.SystemInfra.Enums;

namespace FitMind.BackEnd.SystemInfra.Entities;

public class Challenge : BaseEntity
{
    public Guid CreatedByUserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ChallengeType Type { get; set; }
    public decimal Goal { get; set; }
    public string Unit { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public User CreatedBy { get; set; } = null!;
    public ICollection<ChallengeParticipant> Participants { get; set; } = [];
}
