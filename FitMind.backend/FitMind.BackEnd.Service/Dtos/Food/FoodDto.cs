namespace FitMind.BackEnd.Service.Dtos.Food;

public record FoodItemDto(
    Guid Id,
    string Name,
    string? Brand,
    int CaloriesPer100g,
    decimal ProteinPer100g,
    decimal CarbsPer100g,
    decimal FatsPer100g,
    List<PortionDto> CommonPortions
);

public record PortionDto(string Label, int Grams);

public record FoodCalculatedDto(
    Guid FoodId,
    string Name,
    int Grams,
    int Calories,
    decimal Protein,
    decimal Carbs,
    decimal Fat
);

public record ImageAnalysisResultDto(
    List<DetectedFoodDto> DetectedFoods,
    int TotalCalories,
    decimal TotalProtein,
    decimal TotalCarbs,
    decimal TotalFat
);

public record DetectedFoodDto(
    string Name,
    int ConfidencePercent,
    int Grams,
    int Calories,
    decimal Protein,
    decimal Carbs,
    decimal Fat
);
