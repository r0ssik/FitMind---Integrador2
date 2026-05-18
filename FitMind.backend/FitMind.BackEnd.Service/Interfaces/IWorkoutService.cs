using FitMind.BackEnd.Service.Dtos.Workout;

namespace FitMind.BackEnd.Service.Interfaces;

public interface IWorkoutService
{
    Task<WorkoutPlanDto?> GetActivePlanAsync(Guid userId);
    Task<IEnumerable<WorkoutPlanDto>> GetHistoryAsync(Guid userId);
    Task<WorkoutPlanDto> CreatePlanAsync(Guid userId, CreateWorkoutPlanDto dto);
    Task SetActivePlanAsync(Guid userId, Guid planId);
    Task LogSessionAsync(Guid userId, LogWorkoutSessionDto dto);
}
