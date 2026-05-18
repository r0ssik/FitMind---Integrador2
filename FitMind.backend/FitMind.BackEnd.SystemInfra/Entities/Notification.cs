using FitMind.BackEnd.SystemInfra.Base;
using FitMind.BackEnd.SystemInfra.Enums;

namespace FitMind.BackEnd.SystemInfra.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;

    public User User { get; set; } = null!;
}
