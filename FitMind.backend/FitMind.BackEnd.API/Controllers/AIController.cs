using FitMind.BackEnd.API.Extensions;
using FitMind.BackEnd.Service.Dtos.Workout;
using FitMind.BackEnd.Service.Services.AI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitMind.BackEnd.API.Controllers.AI;

[ApiController]
[Authorize]
[Route("api/ai")]
public class AIController(GeminiService geminiService) : ControllerBase
{
    [HttpPost("workout")]
    public async Task<IActionResult> GenerateWorkout([FromBody] AiGenerateWorkoutDto request)
    {
        var userId = User.GetUserId();
        var result = await geminiService.GenerateWorkoutAsync(userId, request);
        return Ok(result);
    }

    [HttpPost("diet")]
    public async Task<IActionResult> GenerateDiet([FromBody] AiGenerateDietDto request)
    {
        var userId = User.GetUserId();
        var result = await geminiService.GenerateDietAsync(userId, request);
        return Ok(result);
    }
}