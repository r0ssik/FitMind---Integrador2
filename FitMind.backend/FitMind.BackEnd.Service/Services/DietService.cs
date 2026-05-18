using FitMind.BackEnd.Service.Dtos.Diet;
using FitMind.BackEnd.Service.Interfaces;
using FitMind.BackEnd.SystemInfra.ContextDb;
using FitMind.BackEnd.SystemInfra.Entities;
using Microsoft.EntityFrameworkCore;

namespace FitMind.BackEnd.Service.Services;

public class DietService(AppDbContext context) : IDietService
{
    public async Task<DietPlanDto?> GetActivePlanAsync(Guid userId)
    {
        var plan = await context.DietPlans
            .Include(p => p.Meals)
            .FirstOrDefaultAsync(p => p.UserId == userId && p.IsActive);

        return plan is null ? null : MapToDto(plan);
    }

    public async Task<IEnumerable<DietPlanDto>> GetHistoryAsync(Guid userId)
    {
        var plans = await context.DietPlans
            .Include(p => p.Meals)
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return plans.Select(MapToDto);
    }

    public async Task<DietPlanDto> CreatePlanAsync(Guid userId, CreateDietPlanDto dto)
    {
        await context.DietPlans
            .Where(p => p.UserId == userId && p.IsActive)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsActive, false));

        var plan = new DietPlan
        {
            UserId = userId,
            Name = dto.Name,
            Goal = dto.Goal,
            Budget = dto.Budget,
            Restrictions = dto.Restrictions,
            IsActive = true,
            IsAiGenerated = false
        };

        await context.DietPlans.AddAsync(plan);
        await context.SaveChangesAsync();

        return MapToDto(plan);
    }

    public async Task LogFoodEntryAsync(Guid userId, LogFoodEntryDto dto)
    {
        var entry = new FoodDiaryEntry
        {
            UserId = userId,
            Date = dto.Date.Date,
            MealType = dto.MealType,
            FoodName = dto.FoodName,
            Quantity = dto.Quantity,
            Unit = dto.Unit,
            Calories = dto.Calories,
            Proteins = dto.Proteins,
            Carbs = dto.Carbs,
            Fats = dto.Fats
        };

        await context.FoodDiaryEntries.AddAsync(entry);
        await context.SaveChangesAsync();
    }

    public async Task<IEnumerable<object>> GetDiaryByDateAsync(Guid userId, DateTime date)
    {
        return await context.FoodDiaryEntries
            .Where(e => e.UserId == userId && e.Date.Date == date.Date)
            .OrderBy(e => e.MealType)
            .Select(e => (object)new
            {
                e.Id, e.MealType, e.FoodName, e.Quantity, e.Unit,
                e.Calories, e.Proteins, e.Carbs, e.Fats
            })
            .ToListAsync();
    }

    private static DietPlanDto MapToDto(DietPlan p) => new(
        p.Id, p.Name, p.Goal, p.Budget, p.Restrictions, p.DailyCalories,
        p.IsAiGenerated, p.CreatedAt,
        p.Meals.Select(m => new MealDto(
            m.Id, m.Name, m.Time, m.Calories, m.Proteins, m.Carbs, m.Fats, m.Description
        )).ToList()
    );
}
