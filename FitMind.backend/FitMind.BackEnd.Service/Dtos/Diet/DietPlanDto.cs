using System.Text.Json.Serialization;
using FitMind.BackEnd.Service.Converters;
using FitMind.BackEnd.SystemInfra.Enums;

namespace FitMind.BackEnd.Service.Dtos.Diet;

public record DietPlanDto(
    Guid Id,
    string Name,
    DietGoal Goal,
    string? Budget,
    string? Restrictions,
    int DailyCalories,
    bool IsAiGenerated,
    DateTime CreatedAt,
    List<MealDto> Meals
);

public record MealDto(
    Guid Id,
    string Name,
    string Time,
    int Calories,
    decimal Proteins,
    decimal Carbs,
    decimal Fats,
    string? Description
);

public record CreateDietPlanDto(
    string Name,
    DietGoal Goal,
    [property: JsonConverter(typeof(StringOrNumberConverter))]
    string? Budget,
    string? Restrictions,
    int DailyCalories = 0,
    bool IsAiGenerated = false,
    List<CreateMealDto>? Meals = null
);

public record CreateMealDto(
    string Name,
    string Time,
    int Calories,
    decimal Proteins,
    decimal Carbs,
    decimal Fats,
    string? Description
);

public record LogFoodEntryDto(
    DateTime Date,
    string MealType,
    string FoodName,
    decimal Quantity,
    string Unit,
    int Calories,
    decimal Proteins,
    decimal Carbs,
    decimal Fats
);
