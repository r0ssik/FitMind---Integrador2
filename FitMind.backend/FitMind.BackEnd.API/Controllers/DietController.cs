using FitMind.BackEnd.API.Extensions;
using FitMind.BackEnd.Service.Dtos.Diet;
using FitMind.BackEnd.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitMind.BackEnd.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class DietController(IDietService dietService) : ControllerBase
{
    [HttpGet("active")]
    public async Task<IActionResult> GetActivePlan()
    {
        var userId = User.GetUserId();
        var plan = await dietService.GetActivePlanAsync(userId);
        return plan is null ? NotFound() : Ok(plan);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var userId = User.GetUserId();
        return Ok(await dietService.GetHistoryAsync(userId));
    }

    [HttpPost]
    public async Task<IActionResult> CreatePlan([FromBody] CreateDietPlanDto dto)
    {
        var userId = User.GetUserId();
        var plan = await dietService.CreatePlanAsync(userId, dto);
        return CreatedAtAction(nameof(GetActivePlan), plan);
    }

    [HttpPost("diary")]
    public async Task<IActionResult> LogFood([FromBody] LogFoodEntryDto dto)
    {
        var userId = User.GetUserId();
        await dietService.LogFoodEntryAsync(userId, dto);
        return Created();
    }

    [HttpGet("diary")]
    public async Task<IActionResult> GetDiary([FromQuery] DateTime date)
    {
        var userId = User.GetUserId();
        return Ok(await dietService.GetDiaryByDateAsync(userId, date));
    }
}
