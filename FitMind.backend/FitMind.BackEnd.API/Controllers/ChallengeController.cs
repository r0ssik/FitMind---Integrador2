using FitMind.BackEnd.API.Extensions;
using FitMind.BackEnd.Service.Dtos.Challenge;
using FitMind.BackEnd.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitMind.BackEnd.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ChallengeController(IChallengeService challengeService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = User.GetUserId();
        var challenges = await challengeService.GetAllAsync(userId);
        return Ok(challenges);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = User.GetUserId();
        try
        {
            var challenge = await challengeService.GetByIdAsync(id, userId);
            return Ok(challenge);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateChallengeDto dto)
    {
        var userId = User.GetUserId();
        var challenge = await challengeService.CreateAsync(userId, dto);
        return CreatedAtAction(nameof(GetById), new { id = challenge.Id }, challenge);
    }

    [HttpPost("{id}/join")]
    public async Task<IActionResult> Join(Guid id)
    {
        var userId = User.GetUserId();
        try
        {
            await challengeService.JoinAsync(id, userId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/progress")]
    public async Task<IActionResult> UpdateProgress(Guid id, [FromBody] UpdateChallengeProgressDto dto)
    {
        var userId = User.GetUserId();
        try
        {
            await challengeService.UpdateProgressAsync(id, userId, dto);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = User.GetUserId();
        try
        {
            await challengeService.DeleteAsync(id, userId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}
