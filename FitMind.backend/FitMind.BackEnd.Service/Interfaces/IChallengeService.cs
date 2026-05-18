using FitMind.BackEnd.Service.Dtos.Challenge;

namespace FitMind.BackEnd.Service.Interfaces;

public interface IChallengeService
{
    Task<IEnumerable<ChallengeDto>> GetAllAsync(Guid currentUserId);
    Task<ChallengeDto> GetByIdAsync(Guid id, Guid currentUserId);
    Task<ChallengeDto> CreateAsync(Guid userId, CreateChallengeDto dto);
    Task JoinAsync(Guid userId, Guid challengeId);
    Task UpdateProgressAsync(Guid userId, Guid challengeId, UpdateChallengeProgressDto dto);
    Task DeleteAsync(Guid userId, Guid challengeId);
}
