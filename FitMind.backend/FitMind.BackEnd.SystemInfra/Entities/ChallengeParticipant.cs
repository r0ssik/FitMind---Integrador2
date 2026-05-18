using FitMind.BackEnd.SystemInfra.Base;

namespace FitMind.BackEnd.SystemInfra.Entities;

public class ChallengeParticipant : BaseEntity
{
    public Guid ChallengeId { get; set; }
    public Guid UserId { get; set; }
    public decimal CurrentProgress { get; set; } = 0;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    public Challenge Challenge { get; set; } = null!;
    public User User { get; set; } = null!;
}
