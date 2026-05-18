using FitMind.BackEnd.API.Extensions;
using FitMind.BackEnd.Service.Dtos.Progress;
using FitMind.BackEnd.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitMind.BackEnd.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ProgressController(IProgressService progressService) : ControllerBase
{
    /// <summary>Dashboard summary: today's activity, streak, calories, water.</summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var userId = User.GetUserId();
        var dashboard = await progressService.GetDashboardAsync(userId);
        return Ok(dashboard);
    }

    /// <summary>Progress statistics: total workouts, streak, weight delta, achievements.</summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var userId = User.GetUserId();
        var stats = await progressService.GetStatsAsync(userId);
        return Ok(stats);
    }

    /// <summary>Chart data for workouts, weight, calories. ?period=7d|30d|3m</summary>
    [HttpGet("chart")]
    public async Task<IActionResult> GetChartData([FromQuery] string period = "30d")
    {
        var userId = User.GetUserId();
        var data = await progressService.GetChartDataAsync(userId, period);
        return Ok(data);
    }

    /// <summary>Add a manual weight entry.</summary>
    [HttpPost("weight")]
    public async Task<IActionResult> AddWeight([FromBody] AddWeightDto dto)
    {
        var userId = User.GetUserId();
        await progressService.AddWeightEntryAsync(userId, dto);
        return NoContent();
    }
}
