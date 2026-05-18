using FitMind.BackEnd.Service.Dtos.Progress;

namespace FitMind.BackEnd.Service.Interfaces;

public interface IProgressService
{
    Task<ProgressStatsDto> GetStatsAsync(Guid userId);
    Task<ChartDataDto> GetChartDataAsync(Guid userId, string period); // 7d/30d/3m
    Task<DashboardProgressDto> GetDashboardAsync(Guid userId);
    Task AddWeightEntryAsync(Guid userId, AddWeightDto dto);
}
