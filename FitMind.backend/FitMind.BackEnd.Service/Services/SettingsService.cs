using FitMind.BackEnd.Service.Dtos.Settings;
using FitMind.BackEnd.Service.Interfaces;
using FitMind.BackEnd.SystemInfra.ContextDb;
using FitMind.BackEnd.SystemInfra.Entities;
using Microsoft.EntityFrameworkCore;

namespace FitMind.BackEnd.Service.Services;

public class SettingsService(AppDbContext context) : ISettingsService
{
    public async Task<UserSettingsDto> GetAsync(Guid userId)
    {
        var s = await GetOrCreateAsync(userId);
        return MapToDto(s);
    }

    public async Task<UserSettingsDto> UpdateAsync(Guid userId, UpdateSettingsDto dto)
    {
        var s = await GetOrCreateAsync(userId);

        if (dto.NotifWorkout.HasValue)    s.NotifWorkout = dto.NotifWorkout.Value;
        if (dto.NotifDiet.HasValue)       s.NotifDiet = dto.NotifDiet.Value;
        if (dto.NotifWater.HasValue)      s.NotifWater = dto.NotifWater.Value;
        if (dto.NotifChallenge.HasValue)  s.NotifChallenge = dto.NotifChallenge.Value;
        if (dto.NotifSocial.HasValue)     s.NotifSocial = dto.NotifSocial.Value;
        if (dto.NotifAchievement.HasValue)s.NotifAchievement = dto.NotifAchievement.Value;
        if (dto.PublicProfile.HasValue)   s.PublicProfile = dto.PublicProfile.Value;
        if (dto.ShowActivity.HasValue)    s.ShowActivity = dto.ShowActivity.Value;
        if (dto.ShowWeight.HasValue)      s.ShowWeight = dto.ShowWeight.Value;
        if (dto.Theme is not null)        s.Theme = dto.Theme;
        if (dto.Language is not null)     s.Language = dto.Language;
        if (dto.CalorieGoal.HasValue)     s.CalorieGoal = dto.CalorieGoal.Value;
        if (dto.WaterGoalCups.HasValue)   s.WaterGoalCups = dto.WaterGoalCups.Value;

        await context.SaveChangesAsync();
        return MapToDto(s);
    }

    private async Task<UserSettings> GetOrCreateAsync(Guid userId)
    {
        var s = await context.UserSettings.FirstOrDefaultAsync(x => x.UserId == userId);
        if (s is not null) return s;

        s = new UserSettings { UserId = userId };
        await context.UserSettings.AddAsync(s);
        await context.SaveChangesAsync();
        return s;
    }

    private static UserSettingsDto MapToDto(UserSettings s) => new(
        s.NotifWorkout, s.NotifDiet, s.NotifWater, s.NotifChallenge,
        s.NotifSocial, s.NotifAchievement,
        s.PublicProfile, s.ShowActivity, s.ShowWeight,
        s.Theme, s.Language, s.CalorieGoal, s.WaterGoalCups);
}
