namespace FitMind.BackEnd.Service.Dtos.Auth;

public record RefreshTokenRequestDto(string AccessToken, string RefreshToken);
