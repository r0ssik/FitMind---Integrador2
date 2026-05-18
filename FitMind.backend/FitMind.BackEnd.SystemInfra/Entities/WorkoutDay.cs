using FitMind.BackEnd.SystemInfra.Base;

namespace FitMind.BackEnd.SystemInfra.Entities;

public class WorkoutDay : BaseEntity
{
    public Guid WorkoutPlanId { get; set; }
    public string DayName { get; set; } = string.Empty;
    public string Focus { get; set; } = string.Empty;
    public int OrderIndex { get; set; }

    public WorkoutPlan WorkoutPlan { get; set; } = null!;
    public ICollection<Exercise> Exercises { get; set; } = [];
}
