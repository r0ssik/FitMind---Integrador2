namespace FitMind.BackEnd.Service.Dtos.Profile;

public record PublicProfileDto(
    Guid Id,
    string Name,
    string Initials,
    string? Bio,
    string? AvatarUrl,
    int FollowersCount,
    int FollowingCount,
    int TotalWorkouts,
    int CurrentStreak,
    bool IsFollowing,
    bool IsMe,
    List<BadgeDto> Badges,
    List<ActivityDto> RecentActivity
);

public record BadgeDto(string Icon, string Title, bool IsRare);

public record ActivityDto(
    string Icon,
    string Text,
    DateTime OccurredAt,
    string Tag
);
