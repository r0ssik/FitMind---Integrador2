using FitMind.BackEnd.Service.Dtos.Water;
using FitMind.BackEnd.Service.Interfaces;
using FitMind.BackEnd.SystemInfra.ContextDb;
using FitMind.BackEnd.SystemInfra.Entities;
using Microsoft.EntityFrameworkCore;

namespace FitMind.BackEnd.Service.Services;

public class WaterService(AppDbContext context) : IWaterService
{
    public async Task<WaterIntakeDto> GetTodayAsync(Guid userId)
    {
        var today = DateTime.UtcNow.Date;
        var entry = await context.WaterIntakes
            .FirstOrDefaultAsync(w => w.UserId == userId && w.Date.Date == today);
        var goal = await GetGoalAsync(userId);
        return new WaterIntakeDto(today, entry?.Cups ?? 0, goal);
    }

    public async Task<WaterIntakeDto> SetCupsAsync(Guid userId, SetWaterCupsDto dto)
    {
        var today = DateTime.UtcNow.Date;
        var entry = await context.WaterIntakes
            .FirstOrDefaultAsync(w => w.UserId == userId && w.Date.Date == today);

        if (entry is null)
        {
            entry = new WaterIntake { UserId = userId, Date = today, Cups = dto.Cups };
            await context.WaterIntakes.AddAsync(entry);
        }
        else
        {
            entry.Cups = dto.Cups;
        }

        await context.SaveChangesAsync();
        var goal = await GetGoalAsync(userId);
        return new WaterIntakeDto(today, entry.Cups, goal);
    }

    public async Task<IEnumerable<WaterIntakeDto>> GetHistoryAsync(Guid userId, int days = 7)
    {
        var since = DateTime.UtcNow.Date.AddDays(-days);
        var goal = await GetGoalAsync(userId);
        return (await context.WaterIntakes
            .Where(w => w.UserId == userId && w.Date >= since)
            .OrderByDescending(w => w.Date)
            .ToListAsync())
            .Select(w => new WaterIntakeDto(w.Date, w.Cups, goal));
    }

    private async Task<int> GetGoalAsync(Guid userId)
    {
        var s = await context.UserSettings.FirstOrDefaultAsync(x => x.UserId == userId);
        return s?.WaterGoalCups ?? 8;
    }
}
