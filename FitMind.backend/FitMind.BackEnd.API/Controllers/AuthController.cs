using FitMind.BackEnd.API.Extensions;
using FitMind.BackEnd.Service.Dtos.Auth;
using FitMind.BackEnd.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitMind.BackEnd.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            var result = await authService.LoginAsync(request);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            var result = await authService.RegisterAsync(request);
            return CreatedAtAction(nameof(Login), result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto request)
    {
        try
        {
            var result = await authService.RefreshTokenAsync(request);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("revoke")]
    public async Task<IActionResult> Revoke([FromBody] string refreshToken)
    {
        await authService.RevokeTokenAsync(refreshToken);
        return NoContent();
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto request)
    {
        await authService.ForgotPasswordAsync(request);
        // Always return 200 to prevent email enumeration
        return Ok(new { message = "Se o e-mail existir, você receberá as instruções em breve." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto request)
    {
        try
        {
            await authService.ResetPasswordAsync(request);
            return Ok(new { message = "Senha redefinida com sucesso." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
