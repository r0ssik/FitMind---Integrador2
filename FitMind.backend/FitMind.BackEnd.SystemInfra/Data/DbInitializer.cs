using System.Text.Json;
using FitMind.BackEnd.SystemInfra.ContextDb;
using FitMind.BackEnd.SystemInfra.Entities;
using Microsoft.EntityFrameworkCore;

namespace FitMind.BackEnd.SystemInfra.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();
        await SeedFoodItemsAsync(context);
        await SeedAchievementsAsync(context);
    }

    // ── Food Items ────────────────────────────────────────────
    private static async Task SeedFoodItemsAsync(AppDbContext context)
    {
        if (await context.FoodItems.AnyAsync()) return;

        var items = new List<FoodItem>
        {
            new() { Name = "Frango grelhado",     CaloriesPer100g = 165, ProteinPer100g = 31,   CarbsPer100g = 0,    FatsPer100g = 3.6m,  CommonPortions = Portions("Filé médio", 120, "Filé grande", 200, "Peito inteiro", 300) },
            new() { Name = "Arroz branco cozido", CaloriesPer100g = 130, ProteinPer100g = 2.7m, CarbsPer100g = 28,   FatsPer100g = 0.3m,  CommonPortions = Portions("Colher de sopa", 25, "Porção média", 150, "Porção grande", 250) },
            new() { Name = "Arroz integral cozido",CaloriesPer100g=111,  ProteinPer100g = 2.6m, CarbsPer100g = 23,   FatsPer100g = 0.9m,  CommonPortions = Portions("Colher de sopa", 25, "Porção média", 150, "Porção grande", 250) },
            new() { Name = "Feijão carioca cozido",CaloriesPer100g=76,   ProteinPer100g = 4.8m, CarbsPer100g = 14,   FatsPer100g = 0.5m,  CommonPortions = Portions("Concha pequena", 80, "Concha média", 130, "Concha grande", 180) },
            new() { Name = "Ovo inteiro cozido",  CaloriesPer100g = 155, ProteinPer100g = 13,   CarbsPer100g = 1.1m, FatsPer100g = 11,    CommonPortions = Portions("1 ovo pequeno", 40, "1 ovo médio", 55, "1 ovo grande", 70) },
            new() { Name = "Banana",               CaloriesPer100g = 89,  ProteinPer100g = 1.1m, CarbsPer100g = 23,   FatsPer100g = 0.3m,  CommonPortions = Portions("Banana pequena", 80, "Banana média", 120, "Banana grande", 160) },
            new() { Name = "Batata-doce cozida",  CaloriesPer100g = 86,  ProteinPer100g = 1.6m, CarbsPer100g = 20,   FatsPer100g = 0.1m,  CommonPortions = Portions("Porção pequena", 100, "Porção média", 150, "Porção grande", 200) },
            new() { Name = "Whey Protein",         CaloriesPer100g = 380, ProteinPer100g = 75,   CarbsPer100g = 8,    FatsPer100g = 4,     CommonPortions = Portions("1 scoop (30g)", 30, "2 scoops", 60) },
            new() { Name = "Iogurte grego integral",CaloriesPer100g=97,  ProteinPer100g = 9,    CarbsPer100g = 4,    FatsPer100g = 5,     CommonPortions = Portions("Pote pequeno (100g)", 100, "Pote médio (170g)", 170) },
            new() { Name = "Pão integral",         CaloriesPer100g = 247, ProteinPer100g = 8,    CarbsPer100g = 41,   FatsPer100g = 4,     CommonPortions = Portions("1 fatia fina", 25, "1 fatia grossa", 40, "2 fatias", 50) },
            new() { Name = "Salmão grelhado",      CaloriesPer100g = 208, ProteinPer100g = 20,   CarbsPer100g = 0,    FatsPer100g = 13,    CommonPortions = Portions("File pequeno", 100, "File médio", 150, "File grande", 200) },
            new() { Name = "Aveia em flocos",      CaloriesPer100g = 389, ProteinPer100g = 17,   CarbsPer100g = 66,   FatsPer100g = 7,     CommonPortions = Portions("Colher de sopa", 15, "Porção (40g)", 40, "Xícara", 80) },
            new() { Name = "Maçã",                 CaloriesPer100g = 52,  ProteinPer100g = 0.3m, CarbsPer100g = 14,   FatsPer100g = 0.2m,  CommonPortions = Portions("Maçã pequena", 120, "Maçã média", 180, "Maçã grande", 240) },
            new() { Name = "Amendoim torrado",     CaloriesPer100g = 567, ProteinPer100g = 26,   CarbsPer100g = 16,   FatsPer100g = 49,    CommonPortions = Portions("Punhado (15g)", 15, "Porção (30g)", 30, "100g", 100) },
            new() { Name = "Leite desnatado",      CaloriesPer100g = 35,  ProteinPer100g = 3.4m, CarbsPer100g = 5,    FatsPer100g = 0.1m,  CommonPortions = Portions("Copo (200ml)", 200, "Copo grande (300ml)", 300) },
            new() { Name = "Peito de peru",        CaloriesPer100g = 109, ProteinPer100g = 22,   CarbsPer100g = 1.5m, FatsPer100g = 1.5m,  CommonPortions = Portions("1 fatia", 30, "3 fatias", 90) },
            new() { Name = "Queijo cottage",       CaloriesPer100g = 98,  ProteinPer100g = 11,   CarbsPer100g = 3.4m, FatsPer100g = 4.3m,  CommonPortions = Portions("Colher de sopa", 30, "Porção (100g)", 100) },
            new() { Name = "Atum em lata (água)",  CaloriesPer100g = 116, ProteinPer100g = 26,   CarbsPer100g = 0,    FatsPer100g = 0.5m,  CommonPortions = Portions("Lata pequena (170g)", 130, "Lata grande (200g)", 160) },
            new() { Name = "Espinafre cru",        CaloriesPer100g = 23,  ProteinPer100g = 2.9m, CarbsPer100g = 3.6m, FatsPer100g = 0.4m,  CommonPortions = Portions("Punhado (30g)", 30, "Xícara (60g)", 60) },
            new() { Name = "Azeite de oliva",      CaloriesPer100g = 884, ProteinPer100g = 0,    CarbsPer100g = 0,    FatsPer100g = 100,   CommonPortions = Portions("1 colher de chá", 5, "1 colher de sopa", 13) },
        };

        await context.FoodItems.AddRangeAsync(items);
        await context.SaveChangesAsync();
    }

    private static string Portions(params object[] args)
    {
        var list = new List<object>();
        for (int i = 0; i < args.Length - 1; i += 2)
            list.Add(new { label = args[i], grams = args[i + 1] });
        return JsonSerializer.Serialize(list);
    }

    // ── Achievements ──────────────────────────────────────────
    private static async Task SeedAchievementsAsync(AppDbContext context)
    {
        if (await context.Achievements.AnyAsync()) return;

        var items = new List<Achievement>
        {
            // Workout
            new() { Name = "Primeiro Treino",      Description = "Complete seu primeiro treino",              Category = "workout",    Icon = "fitness_center",    Condition = "workouts>=1",   Points = 10  },
            new() { Name = "10 Treinos",            Description = "Complete 10 treinos",                       Category = "workout",    Icon = "fitness_center",    Condition = "workouts>=10",  Points = 50  },
            new() { Name = "50 Treinos",            Description = "Complete 50 treinos",                       Category = "workout",    Icon = "military_tech",     Condition = "workouts>=50",  Points = 150 },
            new() { Name = "100 Treinos",           Description = "Complete 100 treinos",                      Category = "workout",    Icon = "emoji_events",      Condition = "workouts>=100", Points = 300 },
            new() { Name = "Maratonista",           Description = "Complete um treino com mais de 90 minutos", Category = "workout",    Icon = "directions_run",    Condition = "duration>=90",  Points = 100 },
            new() { Name = "Madrugador",            Description = "Treine antes das 7h da manhã",              Category = "workout",    Icon = "wb_sunny",          Condition = "before_7am",    Points = 75  },

            // Diet
            new() { Name = "Dieta Limpa",          Description = "Fique 7 dias consecutivos dentro da meta calórica", Category = "diet", Icon = "restaurant",      Condition = "diet_streak>=7",  Points = 100 },
            new() { Name = "Hidratado",             Description = "Beba 2L de água por 30 dias",              Category = "diet",       Icon = "water_drop",        Condition = "water_streak>=30",Points = 200 },
            new() { Name = "Verde Todo Dia",        Description = "Registre vegetais por 14 dias seguidos",   Category = "diet",       Icon = "eco",               Condition = "veggie_streak>=14",Points = 150 },
            new() { Name = "Chef FitMind",          Description = "Registre 200 refeições no diário",         Category = "diet",       Icon = "local_dining",      Condition = "meals>=200",    Points = 200 },

            // Streak / Consistência
            new() { Name = "Uma Semana",            Description = "Treine por 7 dias seguidos",                Category = "streak",     Icon = "local_fire_department", Condition = "streak>=7",   Points = 100 },
            new() { Name = "Mês Perfeito",          Description = "Treine por 30 dias seguidos",               Category = "streak",     Icon = "star",              Condition = "streak>=30",    Points = 500 },
            new() { Name = "Inabalável",            Description = "Treine por 60 dias seguidos",               Category = "streak",     Icon = "bolt",              Condition = "streak>=60",    Points = 1000},

            // Challenges
            new() { Name = "Desafiador",            Description = "Participe do seu primeiro desafio",         Category = "challenge",  Icon = "flag",              Condition = "challenges>=1", Points = 50  },
            new() { Name = "Campeão",               Description = "Vença um desafio em grupo",                 Category = "challenge",  Icon = "emoji_events",      Condition = "challenge_win>=1",Points = 300},
            new() { Name = "Veterano",              Description = "Complete 5 desafios",                        Category = "challenge",  Icon = "military_tech",     Condition = "challenges>=5", Points = 250 },
        };

        await context.Achievements.AddRangeAsync(items);
        await context.SaveChangesAsync();
    }
}
