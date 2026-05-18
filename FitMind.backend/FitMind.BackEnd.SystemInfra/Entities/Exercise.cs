using FitMind.BackEnd.SystemInfra.Base;

namespace FitMind.BackEnd.SystemInfra.Entities;

public class Exercise : BaseEntity
{
    public Guid WorkoutDayId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Sets { get; set; }
    public string Reps { get; set; } = string.Empty;
    public string RestTime { get; set; } = string.Empty;
    public int EffortLevel { get; set; }
    public string? Tips { get; set; }
    public int OrderIndex { get; set; }

    public WorkoutDay WorkoutDay { get; set; } = null!;
}
