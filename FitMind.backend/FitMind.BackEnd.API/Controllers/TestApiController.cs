using Microsoft.AspNetCore.Mvc;

namespace FitMind.BackEnd.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestApiController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { message = "FitMind API is running!", timestamp = DateTime.UtcNow });
}
