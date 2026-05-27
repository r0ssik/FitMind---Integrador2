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
        // Desativa plano anterior
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
            DailyCalories = dto.DailyCalories,
            IsActive = true,
            IsAiGenerated = dto.IsAiGenerated
        };

        // Persiste refeições se fornecidas
        if (dto.Meals is { Count: > 0 })
        {
            plan.Meals = dto.Meals.Select(m => new Meal
            {
                Name        = m.Name,
                Time        = m.Time,
                Calories    = m.Calories,
                Proteins    = m.Proteins,
                Carbs       = m.Carbs,
                Fats        = m.Fats,
                Description = m.Description,
            }).ToList();
        }

        await context.DietPlans.AddAsync(plan);
        await context.SaveChangesAsync();

        // Recarrega as refeições para retornar o DTO completo
        await context.Entry(plan).Collection(p => p.Meals).LoadAsync();

        return MapToDto(plan);
    }

    public async Task ActivatePlanAsync(Guid userId, Guid planId)
    {
        // Confirma que o plano pertence ao usuário
        var plan = await context.DietPlans
            .FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId)
            ?? throw new KeyNotFoundException("Plano não encontrado.");

        // Desativa todos os planos ativos
        await context.DietPlans
            .Where(p => p.UserId == userId && p.IsActive)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsActive, false));

        plan.IsActive = true;
        await context.SaveChangesAsync();
    }

    public async Task LogFoodEntryAsync(Guid userId, LogFoodEntryDto dto)
    {
        var entry = new FoodDiaryEntry
        {
            UserId = userId,
            Date = DateTime.SpecifyKind(dto.Date.Date, DateTimeKind.Utc),
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
        var dateUtc    = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
        var nextDayUtc = dateUtc.AddDays(1);
        return await context.FoodDiaryEntries
            .Where(e => e.UserId == userId && e.Date >= dateUtc && e.Date < nextDayUtc)
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
