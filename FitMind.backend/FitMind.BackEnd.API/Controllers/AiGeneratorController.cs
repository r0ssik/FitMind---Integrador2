using FitMind.BackEnd.API.Extensions;
using FitMind.BackEnd.Service.Dtos.Workout;
using FitMind.BackEnd.Service.Dtos.Diet;
using FitMind.BackEnd.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitMind.BackEnd.API.Controllers;

[ApiController]
[Authorize]
[Route("api/ai")]
public class AiGeneratorController(IAiGeneratorService aiService) : ControllerBase
{
    /// <summary>Generate a personalised workout plan using AI/rules.</summary>
    [HttpPost("workout")]
    public async Task<IActionResult> GenerateWorkout([FromBody] AiGenerateWorkoutDto dto)
    {
        var userId = User.GetUserId();
        try
        {
            var plan = await aiService.GenerateWorkoutPlanAsync(userId, dto);
            return Ok(plan);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>Generate a personalised diet plan using AI/rules.</summary>
    [HttpPost("diet")]
    public async Task<IActionResult> GenerateDiet([FromBody] AiGenerateDietDto dto)
    {
        var userId = User.GetUserId();
        try
        {
            var plan = await aiService.GenerateDietPlanAsync(userId, dto);
            return Ok(plan);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
