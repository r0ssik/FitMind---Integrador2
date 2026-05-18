using FitMind.BackEnd.Service.Dtos.Admin;

namespace FitMind.BackEnd.Service.Interfaces;

public interface IAdminService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync();
    Task<IEnumerable<AdminUserDto>> GetUsersAsync(string? search, string? status);
    Task SuspendUserAsync(Guid userId);
    Task BlockUserAsync(Guid userId);
    Task ReactivateUserAsync(Guid userId);
    Task<IEnumerable<ReportDto>> GetReportsAsync(string? status);
    Task UpdateReportStatusAsync(Guid reportId, UpdateReportStatusDto dto);
}
