using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FitMind.BackEnd.SystemInfra.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace FitMind.BackEnd.SystemInfra.Security;

public class TokenService(IConfiguration configuration)
{
    private readonly string _secretKey = configuration["JwtSettings:SecretKey"]
        ?? throw new InvalidOperationException("JwtSettings:SecretKey not configured.");
    private readonly string _issuer = configuration["JwtSettings:Issuer"] ?? "FitMindAPI";
    private readonly string _audience = configuration["JwtSettings:Audience"] ?? "FitMindClient";
    private readonly int _expirationMinutes = int.Parse(configuration["JwtSettings:ExpirationMinutes"] ?? "60");
    private readonly int _refreshExpirationDays = int.Parse(configuration["JwtSettings:RefreshExpirationDays"] ?? "7");

    public string GenerateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

    public DateTime GetRefreshTokenExpiration() =>
        DateTime.UtcNow.AddDays(_refreshExpirationDays);

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var validationParams = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey)),
            ValidateLifetime = false
        };

        try
        {
            var principal = new JwtSecurityTokenHandler()
                .ValidateToken(token, validationParams, out var securityToken);

            if (securityToken is not JwtSecurityToken jwtToken ||
                !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.OrdinalIgnoreCase))
                return null;

            return principal;
        }
        catch
        {
            return null;
        }
    }
}
