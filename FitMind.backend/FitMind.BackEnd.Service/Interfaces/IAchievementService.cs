using FitMind.BackEnd.Service.Dtos.Achievement;

namespace FitMind.BackEnd.Service.Interfaces;

public interface IAchievementService
{
    Task<IEnumerable<AchievementDto>> GetAllForUserAsync(Guid userId);
    Task CheckAndUnlockAsync(Guid userId);
}
