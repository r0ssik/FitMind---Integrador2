using FitMind.BackEnd.SystemInfra.Base;
using FitMind.BackEnd.SystemInfra.Enums;

namespace FitMind.BackEnd.SystemInfra.Entities;

public class WorkoutPlan : BaseEntity
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public WorkoutGoal Goal { get; set; }
    public int DaysPerWeek { get; set; }
    public int Weeks { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsAiGenerated { get; set; } = false;

    public User User { get; set; } = null!;
    public ICollection<WorkoutDay> Days { get; set; } = [];
}
