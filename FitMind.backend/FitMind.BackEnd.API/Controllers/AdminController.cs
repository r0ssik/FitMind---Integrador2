using FitMind.BackEnd.API.Extensions;
using FitMind.BackEnd.Service.Dtos.Admin;
using FitMind.BackEnd.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitMind.BackEnd.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class AdminController(IAdminService adminService) : ControllerBase
{
    private IActionResult ForbidIfNotAdmin()
        => User.IsAdmin() ? null! : Forbid();

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        if (!User.IsAdmin()) return Forbid();
        var stats = await adminService.GetDashboardStatsAsync();
        return Ok(stats);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search,
        [FromQuery] string? status)
    {
        if (!User.IsAdmin()) return Forbid();
        var users = await adminService.GetUsersAsync(search, status);
        return Ok(users);
    }

    [HttpPatch("users/{userId}/suspend")]
    public async Task<IActionResult> SuspendUser(Guid userId)
    {
        if (!User.IsAdmin()) return Forbid();
        try
        {
            await adminService.SuspendUserAsync(userId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPatch("users/{userId}/block")]
    public async Task<IActionResult> BlockUser(Guid userId)
    {
        if (!User.IsAdmin()) return Forbid();
        try
        {
            await adminService.BlockUserAsync(userId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPatch("users/{userId}/reactivate")]
    public async Task<IActionResult> ReactivateUser(Guid userId)
    {
        if (!User.IsAdmin()) return Forbid();
        try
        {
            await adminService.ReactivateUserAsync(userId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("reports")]
    public async Task<IActionResult> GetReports([FromQuery] string? status)
    {
        if (!User.IsAdmin()) return Forbid();
        var reports = await adminService.GetReportsAsync(status);
        return Ok(reports);
    }

    [HttpPatch("reports/{reportId}/status")]
    public async Task<IActionResult> UpdateReportStatus(Guid reportId, [FromBody] UpdateReportStatusDto dto)
    {
        if (!User.IsAdmin()) return Forbid();
        try
        {
            await adminService.UpdateReportStatusAsync(reportId, dto);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
