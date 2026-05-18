using FitMind.BackEnd.Service.Dtos.Profile;
using FitMind.BackEnd.Service.Interfaces;
using FitMind.BackEnd.SystemInfra.ContextDb;
using Microsoft.EntityFrameworkCore;

namespace FitMind.BackEnd.Service.Services;

public class ProfileService(AppDbContext context) : IProfileService
{
    public async Task<PublicProfileDto> GetPublicProfileAsync(Guid profileUserId, Guid currentUserId)
    {
        var user = await context.Users
            .Include(u => u.UserAchievements).ThenInclude(ua => ua.Achievement)
            .FirstOrDefaultAsync(u => u.Id == profileUserId)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");

        int followers = await context.Follows.CountAsync(f => f.FollowingId == profileUserId);
        int following = await context.Follows.CountAsync(f => f.FollowerId == profileUserId);
        bool isFollowing = currentUserId != profileUserId &&
            await context.Follows.AnyAsync(f => f.FollowerId == currentUserId && f.FollowingId == profileUserId);

        int totalWorkouts = await context.WorkoutSessions.CountAsync(s => s.UserId == profileUserId);

        var sessions = await context.WorkoutSessions
            .Where(s => s.UserId == profileUserId)
            .Select(s => s.Date.Date)
            .Distinct()
            .OrderByDescending(d => d)
            .ToListAsync();

        int streak = 0;
        var day = DateTime.UtcNow.Date;
        foreach (var d in sessions)
        {
            if (d == day) { streak++; day = day.AddDays(-1); }
            else break;
        }

        var badges = user.UserAchievements
            .Select(ua => new BadgeDto(ua.Achievement.Icon, ua.Achievement.Name, ua.Achievement.Points >= 300))
            .ToList();

        // Recent activity: last 10 workout sessions + achievements
        var recentWorkouts = await context.WorkoutSessions
            .Where(s => s.UserId == profileUserId)
            .OrderByDescending(s => s.Date)
            .Take(5)
            .Select(s => new ActivityDto("fitness_center", $"Completou: {s.WorkoutDayName ?? "Treino"}", s.Date, "Treino"))
            .ToListAsync();

        var recentAchievements = await context.UserAchievements
            .Include(ua => ua.Achievement)
            .Where(ua => ua.UserId == profileUserId)
            .OrderByDescending(ua => ua.UnlockedAt)
            .Take(5)
            .Select(ua => new ActivityDto(ua.Achievement.Icon, $"Desbloqueou: {ua.Achievement.Name}", ua.UnlockedAt, "Conquista"))
            .ToListAsync();

        var activity = recentWorkouts.Concat(recentAchievements)
            .OrderByDescending(a => a.OccurredAt)
            .Take(10)
            .ToList();

        string initials = string.IsNullOrWhiteSpace(user.Name) ? "?" :
            string.Concat(user.Name.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                              .Take(2).Select(w => char.ToUpper(w[0])));

        return new PublicProfileDto(
            user.Id, user.Name, initials, user.Bio, user.AvatarUrl,
            followers, following, totalWorkouts, streak,
            isFollowing, profileUserId == currentUserId,
            badges, activity);
    }
}
