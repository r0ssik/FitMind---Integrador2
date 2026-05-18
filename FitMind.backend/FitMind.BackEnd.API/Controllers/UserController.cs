using FitMind.BackEnd.API.Extensions;
using FitMind.BackEnd.Service.Dtos.User;
using FitMind.BackEnd.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitMind.BackEnd.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class UserController(IUserService userService) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userId = User.GetUserId();
        var user = await userService.GetByIdAsync(userId);
        return Ok(user);
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateUserDto dto)
    {
        var userId = User.GetUserId();
        var updated = await userService.UpdateAsync(userId, dto);
        return Ok(updated);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var user = await userService.GetByIdAsync(id);
            return Ok(user);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // Admin only
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var users = await userService.GetAllAsync();
        return Ok(users);
    }

    [HttpPatch("{id}/active")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SetActive(Guid id, [FromQuery] bool isActive)
    {
        await userService.SetActiveAsync(id, isActive);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await userService.DeleteAsync(id);
        return NoContent();
    }
}
