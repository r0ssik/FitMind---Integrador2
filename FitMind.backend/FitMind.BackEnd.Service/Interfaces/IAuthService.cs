using FitMind.BackEnd.Service.Dtos.Auth;

namespace FitMind.BackEnd.Service.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    Task<LoginResponseDto> RegisterAsync(RegisterRequestDto request);
    Task<LoginResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request);
    Task RevokeTokenAsync(string refreshToken);
    Task<string> ForgotPasswordAsync(ForgotPasswordDto request);
    Task ResetPasswordAsync(ResetPasswordDto request);
}
