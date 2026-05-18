using FitMind.BackEnd.API.Extensions;
using FitMind.BackEnd.Service.Dtos.Workout;
using FitMind.BackEnd.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitMind.BackEnd.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class WorkoutController(IWorkoutService workoutService) : ControllerBase
{
    [HttpGet("active")]
    public async Task<IActionResult> GetActivePlan()
    {
        var userId = User.GetUserId();
        var plan = await workoutService.GetActivePlanAsync(userId);
        return plan is null ? NotFound() : Ok(plan);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var userId = User.GetUserId();
        var history = await workoutService.GetHistoryAsync(userId);
        return Ok(history);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePlan([FromBody] CreateWorkoutPlanDto dto)
    {
        var userId = User.GetUserId();
        var plan = await workoutService.CreatePlanAsync(userId, dto);
        return CreatedAtAction(nameof(GetActivePlan), plan);
    }

    [HttpPatch("{planId}/activate")]
    public async Task<IActionResult> SetActive(Guid planId)
    {
        var userId = User.GetUserId();
        await workoutService.SetActivePlanAsync(userId, planId);
        return NoContent();
    }

    [HttpPost("sessions")]
    public async Task<IActionResult> LogSession([FromBody] LogWorkoutSessionDto dto)
    {
        var userId = User.GetUserId();
        await workoutService.LogSessionAsync(userId, dto);
        return CreatedAtAction(nameof(GetHistory), null);
    }
}
