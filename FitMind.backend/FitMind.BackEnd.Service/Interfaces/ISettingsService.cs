using FitMind.BackEnd.Service.Dtos.Settings;

namespace FitMind.BackEnd.Service.Interfaces;

public interface ISettingsService
{
    Task<UserSettingsDto> GetAsync(Guid userId);
    Task<UserSettingsDto> UpdateAsync(Guid userId, UpdateSettingsDto dto);
}
