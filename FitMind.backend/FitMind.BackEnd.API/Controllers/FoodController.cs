using FitMind.BackEnd.API.Extensions;
using FitMind.BackEnd.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FitMind.BackEnd.API.DTOs.Requests;

namespace FitMind.BackEnd.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class FoodController(IFoodService foodService) : ControllerBase
{
    /// <summary>Search food items by name or brand. ?q=frango</summary>
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest(new { message = "Parâmetro de busca obrigatório." });

        var items = await foodService.SearchAsync(q);
        return Ok(items);
    }

    /// <summary>Calculate macros for a given food item and quantity in grams.</summary>
    [HttpGet("{foodId}/calculate")]
    public async Task<IActionResult> Calculate(Guid foodId, [FromQuery] int grams = 100)
    {
        try
        {
            var result = await foodService.CalculateAsync(foodId, grams);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>Analyze a food photo and return detected items with estimated macros.</summary>
    [HttpPost("analyze-image")]
    [Consumes("multipart/form-data")]
    
    public async Task<IActionResult> AnalyzeImage([FromForm] AnalyzeImageRequest request)
    {
        var image = request.Image;
        
        if (image is null || image.Length == 0)
            return BadRequest(new { message = "Imagem obrigatória." });

        await using var stream = image.OpenReadStream();
        var result = await foodService.AnalyzeImageAsync(stream, image.FileName);
        return Ok(result);
    }
}
