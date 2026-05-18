using FitMind.BackEnd.API.Extensions;
using FitMind.BackEnd.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitMind.BackEnd.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class NotificationController(INotificationService notificationService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = User.GetUserId();
        return Ok(await notificationService.GetByUserAsync(userId));
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        await notificationService.MarkAsReadAsync(id, User.GetUserId());
        return NoContent();
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await notificationService.MarkAllAsReadAsync(User.GetUserId());
        return NoContent();
    }
}
