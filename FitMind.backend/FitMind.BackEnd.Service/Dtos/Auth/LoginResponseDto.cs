namespace FitMind.BackEnd.Service.Dtos.Auth;

public record LoginResponseDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserInfoDto User
);

public record UserInfoDto(
    Guid Id,
    string Name,
    string Email,
    bool IsAdmin
);
