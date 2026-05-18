namespace FitMind.BackEnd.Service.Dtos.Achievement;

public record AchievementDto(
    Guid Id,
    string Name,
    string Description,
    string Category,
    string Icon,
    int Points,
    bool Unlocked,
    DateTime? UnlockedAt,
    int? Progress   // 0-100 for locked ones with partial progress
);
