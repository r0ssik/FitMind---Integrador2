using FitMind.BackEnd.SystemInfra.Enums;

namespace FitMind.BackEnd.Service.Dtos.User;

public record UserDto(
    Guid Id,
    string Name,
    string Email,
    string Phone,
    DateTime BirthDate,
    UserSex Sex,
    decimal Weight,
    decimal Height,
    string? Bio,
    string? AvatarUrl,
    string? Limitations,
    bool IsAdmin,
    bool IsActive,
    DateTime CreatedAt
);
