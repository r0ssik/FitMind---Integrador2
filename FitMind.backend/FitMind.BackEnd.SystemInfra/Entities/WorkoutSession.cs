using FitMind.BackEnd.SystemInfra.Base;

namespace FitMind.BackEnd.SystemInfra.Entities;

public class WorkoutSession : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid? WorkoutPlanId { get; set; }
    public DateTime Date { get; set; }
    public int DurationMinutes { get; set; }
    public string? Feeling { get; set; }
    public string? Notes { get; set; }
    public string? WorkoutDayName { get; set; }
    public string? WorkoutFocus { get; set; }
    public int ExercisesTotal { get; set; }
    public int SetsTotal { get; set; }
    /// <summary>JSON: per-exercise set completion data</summary>
    public string? SessionData { get; set; }

    public User User { get; set; } = null!;
    public WorkoutPlan? WorkoutPlan { get; set; }
}
