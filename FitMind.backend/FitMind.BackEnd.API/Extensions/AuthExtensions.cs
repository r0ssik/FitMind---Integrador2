using System.Security.Claims;

namespace FitMind.BackEnd.API.Extensions;

public static class AuthExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier)
                 ?? user.FindFirst("sub")
                 ?? throw new UnauthorizedAccessException("Usuário não autenticado.");

        return Guid.Parse(claim.Value);
    }

    public static bool IsAdmin(this ClaimsPrincipal user) =>
        user.IsInRole("Admin");
}
