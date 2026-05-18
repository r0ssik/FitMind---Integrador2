using FitMind.BackEnd.API.Extensions;
using FitMind.BackEnd.Service.Dtos.Measurement;
using FitMind.BackEnd.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitMind.BackEnd.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class MeasurementController(IMeasurementService measurementService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = User.GetUserId();
        var measurements = await measurementService.GetAllAsync(userId);
        return Ok(measurements);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] CreateMeasurementDto dto)
    {
        var userId = User.GetUserId();
        var measurement = await measurementService.AddAsync(userId, dto);
        return CreatedAtAction(nameof(GetAll), measurement);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = User.GetUserId();
        try
        {
            await measurementService.DeleteAsync(id, userId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
