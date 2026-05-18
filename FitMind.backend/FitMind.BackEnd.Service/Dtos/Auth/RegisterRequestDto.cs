using FitMind.BackEnd.SystemInfra.Enums;

namespace FitMind.BackEnd.Service.Dtos.Auth;

public record RegisterRequestDto(
    string Name,
    string Email,
    string Password,
    string Phone,
    DateTime BirthDate,
    UserSex Sex,
    decimal Weight,
    decimal Height,
    string? Limitations,
    List<string> Goals,
    int WeeklyAvailability
);
