using FitMind.BackEnd.API.Extensions;
using FitMind.BackEnd.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitMind.BackEnd.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class AchievementController(IAchievementService achievementService) : ControllerBase
{
    /// <summary>Returns all achievements with unlock status and progress for the current user.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = User.GetUserId();
        var achievements = await achievementService.GetAllForUserAsync(userId);
        return Ok(achievements);
    }

    /// <summary>Checks and unlocks any achievements the user has earned. Called after workouts, diet logs, etc.</summary>
    [HttpPost("check")]
    public async Task<IActionResult> Check()
    {
        var userId = User.GetUserId();
        await achievementService.CheckAndUnlockAsync(userId);
        return NoContent();
    }
}
