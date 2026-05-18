using FitMind.BackEnd.API.Extensions;
using FitMind.BackEnd.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitMind.BackEnd.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class HistoryController(IHistoryService historyService) : ControllerBase
{
    /// <summary>Full history: workouts, diet days, achievements unlocked.</summary>
    [HttpGet]
    public async Task<IActionResult> GetFull()
    {
        var userId = User.GetUserId();
        var history = await historyService.GetFullHistoryAsync(userId);
        return Ok(history);
    }

    /// <summary>Workout history with optional filter string: ?filter=MuscleGain</summary>
    [HttpGet("workouts")]
    public async Task<IActionResult> GetWorkouts([FromQuery] string? filter)
    {
        var userId = User.GetUserId();
        var workouts = await historyService.GetWorkoutHistoryAsync(userId, filter);
        return Ok(workouts);
    }

    /// <summary>Daily diet summaries. ?days=30 (default)</summary>
    [HttpGet("diet")]
    public async Task<IActionResult> GetDiet([FromQuery] int days = 30)
    {
        var userId = User.GetUserId();
        var diet = await historyService.GetDietHistoryAsync(userId, days);
        return Ok(diet);
    }
}
