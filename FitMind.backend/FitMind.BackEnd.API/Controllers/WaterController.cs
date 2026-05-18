using FitMind.BackEnd.API.Extensions;
using FitMind.BackEnd.Service.Dtos.Water;
using FitMind.BackEnd.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitMind.BackEnd.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class WaterController(IWaterService waterService) : ControllerBase
{
    /// <summary>Get today's water intake for the current user.</summary>
    [HttpGet("today")]
    public async Task<IActionResult> GetToday()
    {
        var userId = User.GetUserId();
        var intake = await waterService.GetTodayAsync(userId);
        return Ok(intake);
    }

    /// <summary>Set the number of cups for today (upsert).</summary>
    [HttpPost("today")]
    public async Task<IActionResult> SetCups([FromBody] SetWaterCupsDto dto)
    {
        var userId = User.GetUserId();
        var intake = await waterService.SetCupsAsync(userId, dto);
        return Ok(intake);
    }

    /// <summary>Water intake history. Optional: ?days=30</summary>
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] int days = 30)
    {
        var userId = User.GetUserId();
        var history = await waterService.GetHistoryAsync(userId, days);
        return Ok(history);
    }
}
