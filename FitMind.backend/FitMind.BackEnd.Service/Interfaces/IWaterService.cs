using FitMind.BackEnd.Service.Dtos.Water;

namespace FitMind.BackEnd.Service.Interfaces;

public interface IWaterService
{
    Task<WaterIntakeDto> GetTodayAsync(Guid userId);
    Task<WaterIntakeDto> SetCupsAsync(Guid userId, SetWaterCupsDto dto);
    Task<IEnumerable<WaterIntakeDto>> GetHistoryAsync(Guid userId, int days = 7);
}
