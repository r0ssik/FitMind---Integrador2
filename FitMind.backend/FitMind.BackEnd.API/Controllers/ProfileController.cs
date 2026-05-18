using FitMind.BackEnd.API.Extensions;
using FitMind.BackEnd.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitMind.BackEnd.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ProfileController(IProfileService profileService) : ControllerBase
{
    /// <summary>View own profile.</summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = User.GetUserId();
        try
        {
            var profile = await profileService.GetPublicProfileAsync(userId, userId);
            return Ok(profile);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>View another user's public profile.</summary>
    [HttpGet("{targetUserId}")]
    public async Task<IActionResult> GetProfile(Guid targetUserId)
    {
        var viewerId = User.GetUserId();
        try
        {
            var profile = await profileService.GetPublicProfileAsync(targetUserId, viewerId);
            return Ok(profile);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
