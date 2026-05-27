namespace FitMind.BackEnd.Service.Dtos.User;

public record UpdateUserDto(
    string? Name,
    string? Phone,
    string? Bio,
    string? AvatarUrl,
    decimal? Weight,
    decimal? Height,
    string? Limitations,
    string? Goals,
    string? Sex,          // enum name: Male | Female | NonBinary | NotInformed
    DateTime? BirthDate
);
