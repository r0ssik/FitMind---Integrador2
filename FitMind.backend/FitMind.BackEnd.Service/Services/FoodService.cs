using System.Text.Json;
using FitMind.BackEnd.Service.Dtos.Food;
using FitMind.BackEnd.Service.Interfaces;
using FitMind.BackEnd.SystemInfra.ContextDb;
using Microsoft.EntityFrameworkCore;

namespace FitMind.BackEnd.Service.Services;

public class FoodService(AppDbContext context) : IFoodService
{
    public async Task<IEnumerable<FoodItemDto>> SearchAsync(string query)
    {
        var items = await context.FoodItems
            .Where(f => f.Name.ToLower().Contains(query.ToLower()) ||
                        (f.Brand != null && f.Brand.ToLower().Contains(query.ToLower())))
            .Take(20)
            .ToListAsync();

        return items.Select(MapToDto);
    }

    public async Task<FoodCalculatedDto> CalculateAsync(Guid foodId, int grams)
    {
        var food = await context.FoodItems.FindAsync(foodId)
            ?? throw new KeyNotFoundException("Alimento não encontrado.");

        double ratio = grams / 100.0;

        return new FoodCalculatedDto(
            food.Id,
            food.Name,
            grams,
            (int)Math.Round(food.CaloriesPer100g * ratio),
            Math.Round((decimal)(food.ProteinPer100g * (decimal)ratio), 1),
            Math.Round((decimal)(food.CarbsPer100g * (decimal)ratio), 1),
            Math.Round((decimal)(food.FatsPer100g * (decimal)ratio), 1)
        );
    }

    public async Task<ImageAnalysisResultDto> AnalyzeImageAsync(Stream imageStream, string fileName)
    {
        // Deterministic mock: returns plausible results based on file name keywords
        // In production: integrate computer vision API (e.g. Azure Custom Vision or Google Vision)

        var name = Path.GetFileNameWithoutExtension(fileName).ToLower();
        var detected = new List<DetectedFoodDto>();

        var suggestions = await context.FoodItems.Take(3).ToListAsync();

        // Simulate detection with first 2 food items from DB
        foreach (var (food, idx) in suggestions.Take(2).Select((f, i) => (f, i)))
        {
            int grams = idx == 0 ? 150 : 80;
            double ratio = grams / 100.0;
            detected.Add(new DetectedFoodDto(
                food.Name,
                idx == 0 ? 87 : 72,
                grams,
                (int)Math.Round(food.CaloriesPer100g * ratio),
                Math.Round((decimal)(food.ProteinPer100g * (decimal)ratio), 1),
                Math.Round((decimal)(food.CarbsPer100g * (decimal)ratio), 1),
                Math.Round((decimal)(food.FatsPer100g * (decimal)ratio), 1)));
        }

        return new ImageAnalysisResultDto(
            detected,
            detected.Sum(d => d.Calories),
            detected.Sum(d => d.Protein),
            detected.Sum(d => d.Carbs),
            detected.Sum(d => d.Fat));
    }

    private static FoodItemDto MapToDto(SystemInfra.Entities.FoodItem f)
    {
        var portions = new List<PortionDto>();
        if (!string.IsNullOrWhiteSpace(f.CommonPortions))
        {
            try
            {
                var raw = JsonSerializer.Deserialize<List<JsonElement>>(f.CommonPortions);
                if (raw != null)
                    portions = raw.Select(e => new PortionDto(
                        e.GetProperty("label").GetString() ?? "",
                        e.GetProperty("grams").GetInt32())).ToList();
            }
            catch { /* ignore deserialization errors */ }
        }

        return new FoodItemDto(f.Id, f.Name, f.Brand,
            f.CaloriesPer100g, f.ProteinPer100g, f.CarbsPer100g, f.FatsPer100g, portions);
    }
}
