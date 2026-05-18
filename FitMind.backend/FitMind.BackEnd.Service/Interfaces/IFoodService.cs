using FitMind.BackEnd.Service.Dtos.Food;

namespace FitMind.BackEnd.Service.Interfaces;

public interface IFoodService
{
    Task<IEnumerable<FoodItemDto>> SearchAsync(string query);
    Task<FoodCalculatedDto> CalculateAsync(Guid foodId, int grams);
    Task<ImageAnalysisResultDto> AnalyzeImageAsync(Stream imageStream, string fileName);
}
