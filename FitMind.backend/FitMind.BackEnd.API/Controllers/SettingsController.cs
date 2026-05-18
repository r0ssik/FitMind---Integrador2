using FitMind.BackEnd.API.Extensions;
using FitMind.BackEnd.Service.Dtos.Settings;
using FitMind.BackEnd.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitMind.BackEnd.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SettingsController(ISettingsService settingsService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = User.GetUserId();
        var settings = await settingsService.GetAsync(userId);
        return Ok(settings);
    }

    [HttpPatch]
    public async Task<IActionResult> Update([FromBody] UpdateSettingsDto dto)
    {
        var userId = User.GetUserId();
        var settings = await settingsService.UpdateAsync(userId, dto);
        return Ok(settings);
    }
}
