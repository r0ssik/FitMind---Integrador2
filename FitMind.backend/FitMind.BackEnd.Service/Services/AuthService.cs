using BCrypt.Net;
using FitMind.BackEnd.Service.Dtos.Auth;
using FitMind.BackEnd.Service.Interfaces;
using FitMind.BackEnd.SystemInfra.ContextDb;
using FitMind.BackEnd.SystemInfra.Entities;
using FitMind.BackEnd.SystemInfra.Repositories;
using FitMind.BackEnd.SystemInfra.Security;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace FitMind.BackEnd.Service.Services;

public class AuthService(
    UserRepository userRepository,
    AppDbContext context,
    TokenService tokenService) : IAuthService
{
    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await userRepository.GetByEmailAsync(request.Email)
            ?? throw new UnauthorizedAccessException("E-mail ou senha inválidos.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Conta suspensa. Entre em contato com o suporte.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("E-mail ou senha inválidos.");

        return await GenerateTokensAsync(user);
    }

    public async Task<LoginResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        if (await userRepository.ExistsByEmailAsync(request.Email))
            throw new InvalidOperationException("E-mail já cadastrado.");

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Phone = request.Phone,
            BirthDate = request.BirthDate,
            Sex = request.Sex,
            Weight = request.Weight,
            Height = request.Height,
            Limitations = request.Limitations
        };

        await userRepository.AddAsync(user);
        await userRepository.SaveChangesAsync();

        return await GenerateTokensAsync(user);
    }

    public async Task<LoginResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request)
    {
        var principal = tokenService.GetPrincipalFromExpiredToken(request.AccessToken)
            ?? throw new UnauthorizedAccessException("Token inválido.");

        var userIdClaim = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
            ?? principal.FindFirst("sub")
            ?? throw new UnauthorizedAccessException("Token inválido.");

        var userId = Guid.Parse(userIdClaim.Value);

        var storedToken = await context.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == request.RefreshToken
                                   && t.UserId == userId
                                   && !t.IsRevoked
                                   && t.ExpiresAt > DateTime.UtcNow)
            ?? throw new UnauthorizedAccessException("Refresh token inválido ou expirado.");

        storedToken.IsRevoked = true;

        var user = await userRepository.GetByIdAsync(userId)
            ?? throw new UnauthorizedAccessException("Usuário não encontrado.");

        return await GenerateTokensAsync(user);
    }

    public async Task RevokeTokenAsync(string refreshToken)
    {
        var token = await context.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == refreshToken);

        if (token is not null)
        {
            token.IsRevoked = true;
            await context.SaveChangesAsync();
        }
    }

    public async Task<string> ForgotPasswordAsync(ForgotPasswordDto request)
    {
        var user = await userRepository.GetByEmailAsync(request.Email);
        if (user is null) return string.Empty; // silently succeed to avoid email enumeration

        // Invalidate old tokens
        var oldTokens = await context.PasswordResetTokens
            .Where(t => t.UserId == user.Id && !t.IsUsed)
            .ToListAsync();
        foreach (var t in oldTokens) t.IsUsed = true;

        var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48))
            .Replace("+", "-").Replace("/", "_").Replace("=", "");

        await context.PasswordResetTokens.AddAsync(new PasswordResetToken
        {
            UserId = user.Id,
            Token = rawToken,
            ExpiresAt = DateTime.UtcNow.AddHours(1)
        });

        await context.SaveChangesAsync();

        // TODO: send email with reset link containing rawToken
        // e.g. https://app.fitmind.com/reset-password?token={rawToken}
        return rawToken; // return token for development/testing; omit in production
    }

    public async Task ResetPasswordAsync(ResetPasswordDto request)
    {
        var resetToken = await context.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t =>
                t.Token == request.Token &&
                !t.IsUsed &&
                t.ExpiresAt > DateTime.UtcNow)
            ?? throw new InvalidOperationException("Token inválido ou expirado.");

        resetToken.User!.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        resetToken.IsUsed = true;

        // Revoke all refresh tokens for security
        var refreshTokens = await context.RefreshTokens
            .Where(t => t.UserId == resetToken.UserId && !t.IsRevoked)
            .ToListAsync();
        foreach (var t in refreshTokens) t.IsRevoked = true;

        await context.SaveChangesAsync();
    }

    private async Task<LoginResponseDto> GenerateTokensAsync(User user)
    {
        var accessToken = tokenService.GenerateAccessToken(user);
        var refreshToken = tokenService.GenerateRefreshToken();
        var expiresAt = tokenService.GetRefreshTokenExpiration();

        await context.RefreshTokens.AddAsync(new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = expiresAt
        });

        await context.SaveChangesAsync();

        return new LoginResponseDto(
            accessToken,
            refreshToken,
            expiresAt,
            new UserInfoDto(user.Id, user.Name, user.Email, user.IsAdmin)
        );
    }
}
