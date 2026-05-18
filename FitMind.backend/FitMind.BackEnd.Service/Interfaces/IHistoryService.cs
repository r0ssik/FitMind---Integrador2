using FitMind.BackEnd.Service.Dtos.History;

namespace FitMind.BackEnd.Service.Interfaces;

public interface IHistoryService
{
    Task<FullHistoryDto> GetFullHistoryAsync(Guid userId);
    Task<IEnumerable<WorkoutHistoryDto>> GetWorkoutHistoryAsync(Guid userId, string? filter);
    Task<IEnumerable<DietHistoryDto>> GetDietHistoryAsync(Guid userId, int days = 30);
}
