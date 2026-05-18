using FitMind.BackEnd.Service.Dtos.Diet;

namespace FitMind.BackEnd.Service.Interfaces;

public interface IDietService
{
    Task<DietPlanDto?> GetActivePlanAsync(Guid userId);
    Task<IEnumerable<DietPlanDto>> GetHistoryAsync(Guid userId);
    Task<DietPlanDto> CreatePlanAsync(Guid userId, CreateDietPlanDto dto);
    Task LogFoodEntryAsync(Guid userId, LogFoodEntryDto dto);
    Task<IEnumerable<object>> GetDiaryByDateAsync(Guid userId, DateTime date);
}
