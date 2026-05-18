using FitMind.BackEnd.Service.Dtos.Diet;
using FitMind.BackEnd.Service.Dtos.Workout;
using FitMind.BackEnd.Service.Interfaces;
using FitMind.BackEnd.SystemInfra.ContextDb;
using FitMind.BackEnd.SystemInfra.Entities;
using FitMind.BackEnd.SystemInfra.Enums;
using Microsoft.EntityFrameworkCore;

namespace FitMind.BackEnd.Service.Services;

/// <summary>
/// Rule-based AI plan generator.
/// Swap the private Build* methods for real LLM calls (Azure OpenAI, Anthropic, etc.)
/// while keeping the same public contract.
/// </summary>
public class AiGeneratorService(AppDbContext context) : IAiGeneratorService
{
    private sealed record ExTemplate(string Name, int Sets, string Reps, string Rest, string Tips);

    // ──────────────────────────────────────────────────────────────
    // Workout plan generator
    // ──────────────────────────────────────────────────────────────
    public async Task<WorkoutPlanDto> GenerateWorkoutPlanAsync(Guid userId, AiGenerateWorkoutDto dto)
    {
        _ = await context.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");

        // Deactivate current active plan
        var activePlans = await context.WorkoutPlans
            .Where(p => p.UserId == userId && p.IsActive)
            .ToListAsync();
        foreach (var p in activePlans) p.IsActive = false;

        var goal  = InferWorkoutGoal(dto.Preferences);
        var weeks = 8;

        var plan = new WorkoutPlan
        {
            UserId        = userId,
            Name          = $"Plano IA — {WorkoutGoalLabel(goal)}",
            Goal          = goal,
            DaysPerWeek   = dto.DaysPerWeek,
            Weeks         = weeks,
            IsActive      = true,
            IsAiGenerated = true,
            Days          = BuildWorkoutDays(dto, goal)
        };

        await context.WorkoutPlans.AddAsync(plan);
        await context.SaveChangesAsync();

        return new WorkoutPlanDto(
            plan.Id,
            plan.Name,
            plan.Goal,
            plan.DaysPerWeek,
            plan.Weeks,
            plan.IsAiGenerated,
            plan.CreatedAt,
            plan.Days.Select((d, di) => new WorkoutDayDto(
                d.Id,
                d.DayName,
                d.Focus,
                d.OrderIndex,
                d.Exercises.Select(e => new ExerciseDto(
                    e.Id, e.Name, e.Sets, e.Reps, e.RestTime, e.EffortLevel, e.Tips)
                ).ToList()
            )).ToList());
    }

    // ──────────────────────────────────────────────────────────────
    // Diet plan generator
    // ──────────────────────────────────────────────────────────────
    public async Task<DietPlanDto> GenerateDietPlanAsync(Guid userId, AiGenerateDietDto dto)
    {
        var user = await context.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");

        // Deactivate current active diet plans
        var activePlans = await context.DietPlans
            .Where(p => p.UserId == userId && p.IsActive)
            .ToListAsync();
        foreach (var p in activePlans) p.IsActive = false;

        var goal         = ParseDietGoal(dto.Goal);
        int dailyCalories = CalcDailyCalories(user, goal);
        string planName  = $"Plano IA — {DietGoalLabel(goal)}";
        string? restrictions = dto.Restrictions?.Count > 0
            ? string.Join(", ", dto.Restrictions)
            : null;

        var plan = new DietPlan
        {
            UserId        = userId,
            Name          = planName,
            Goal          = goal,
            Budget        = dto.Budget,
            Restrictions  = restrictions,
            DailyCalories = dailyCalories,
            IsActive      = true,
            IsAiGenerated = true,
            Meals         = BuildMeals(dailyCalories, dto)
        };

        await context.DietPlans.AddAsync(plan);
        await context.SaveChangesAsync();

        return new DietPlanDto(
            plan.Id,
            plan.Name,
            plan.Goal,
            plan.Budget,
            plan.Restrictions,
            plan.DailyCalories,
            plan.IsAiGenerated,
            plan.CreatedAt,
            plan.Meals.Select(m => new MealDto(
                m.Id, m.Name, m.Time, m.Calories, m.Proteins, m.Carbs, m.Fats, null)
            ).ToList());
    }

    // ──────────────────────────────────────────────────────────────
    // Workout building helpers
    // ──────────────────────────────────────────────────────────────
    private static List<WorkoutDay> BuildWorkoutDays(AiGenerateWorkoutDto dto, WorkoutGoal goal)
    {
        var templates  = GetExerciseTemplates(goal, dto.Location);
        var dayNames   = GetDayNames(dto.DaysPerWeek);
        bool isHome    = dto.Location?.ToLower() is "casa" or "ar_livre";
        int effortInt  = isHome ? 2 : 3;   // 1=Leve 2=Moderado 3=Intenso

        return Enumerable.Range(0, dto.DaysPerWeek).Select(i =>
        {
            var (focus, exercises) = templates[i % templates.Count];
            return new WorkoutDay
            {
                DayName    = dayNames[i],
                Focus      = focus,
                OrderIndex = i,
                Exercises  = exercises.Select((e, idx) => new Exercise
                {
                    Name        = e.Name,
                    Sets        = e.Sets,
                    Reps        = e.Reps,
                    RestTime    = e.Rest,
                    EffortLevel = effortInt,
                    Tips        = e.Tips,
                    OrderIndex  = idx
                }).ToList()
            };
        }).ToList();
    }

    private static WorkoutGoal InferWorkoutGoal(List<string>? preferences)
    {
        if (preferences is null || preferences.Count == 0) return WorkoutGoal.GeneralHealth;

        var joined = string.Join(" ", preferences).ToLower();

        if (joined.Contains("muscula") || joined.Contains("forca") || joined.Contains("força") || joined.Contains("hipertrofia"))
            return WorkoutGoal.MuscleGain;
        if (joined.Contains("emagrec") || joined.Contains("perda") || joined.Contains("hiit") || joined.Contains("cardio"))
            return WorkoutGoal.WeightLoss;
        if (joined.Contains("resist") || joined.Contains("corrida") || joined.Contains("endurance"))
            return WorkoutGoal.Endurance;
        if (joined.Contains("yoga") || joined.Contains("pilates") || joined.Contains("flexi"))
            return WorkoutGoal.Flexibility;

        return WorkoutGoal.GeneralHealth;
    }

    private static List<(string Focus, List<ExTemplate> Exercises)> GetExerciseTemplates(
        WorkoutGoal goal, string? location)
    {
        bool home = location?.ToLower() is "casa" or "ar_livre";

        return goal switch
        {
            WorkoutGoal.MuscleGain when !home => new()
            {
                ("Peito e Tríceps", new()
                {
                    new("Supino Reto",           4, "8-12",   "90s",  "Cotovelos a 45°"),
                    new("Supino Inclinado",       3, "10-12",  "75s",  "Foco na contração"),
                    new("Crucifixo",              3, "12-15",  "60s",  "Movimento em arco"),
                    new("Tríceps Pulley",         3, "12-15",  "60s",  "Cotovelos fixos"),
                    new("Tríceps Testa",          3, "10-12",  "60s",  "Desça devagar"),
                }),
                ("Costas e Bíceps", new()
                {
                    new("Puxada Frontal",         4, "8-12",   "75s",  "Puxe até o queixo"),
                    new("Remada Curvada",         4, "8-12",   "75s",  "Costas neutras"),
                    new("Remada Unilateral",      3, "10-12",  "60s",  "Cotovelo guia"),
                    new("Rosca Direta",           3, "10-12",  "60s",  "Sem balanço"),
                    new("Rosca Martelo",          3, "12-15",  "60s",  "Amplitude completa"),
                }),
                ("Pernas e Glúteos", new()
                {
                    new("Agachamento",            4, "8-12",   "120s", "Joelhos alinhados"),
                    new("Leg Press",              4, "10-12",  "90s",  "Não trave os joelhos"),
                    new("Cadeira Extensora",      3, "12-15",  "60s",  "Pausa no topo"),
                    new("Stiff",                  3, "10-12",  "75s",  "Quadril empurra para trás"),
                    new("Cadeira Flexora",        3, "12-15",  "60s",  "Amplitude total"),
                }),
                ("Ombros e Abdômen", new()
                {
                    new("Desenvolvimento",        4, "8-12",   "75s",  "Cotovelos à frente"),
                    new("Elevação Lateral",       3, "15",     "60s",  "Leve, foco na contração"),
                    new("Elevação Frontal",       3, "12",     "60s",  "Cotovelo levemente flexionado"),
                    new("Prancha",                3, "45s",    "45s",  "Quadril nivelado"),
                    new("Abdominal Supra",        3, "20",     "45s",  "Expirar na subida"),
                }),
            },

            WorkoutGoal.MuscleGain => /* home */ new()
            {
                ("Upper Body", new()
                {
                    new("Flexão",                3, "15",      "60s",  "Corpo alinhado"),
                    new("Flexão Inclinada",      3, "12",      "60s",  "Foco no alto do peitoral"),
                    new("Flexão Diamante",       3, "10",      "60s",  "Tríceps em destaque"),
                    new("Afundo de Bíceps",      3, "12 cada", "60s",  "Movimento controlado"),
                    new("Pike Push-up",          3, "10",      "60s",  "Ombros no topo"),
                }),
                ("Lower Body", new()
                {
                    new("Agachamento",           3, "20",      "60s",  "Postura ereta"),
                    new("Agachamento Sumo",      3, "15",      "60s",  "Pés afastados"),
                    new("Afundo Alternado",      3, "12 cada", "60s",  "Passos amplos"),
                    new("Elevação Pélvica",      3, "15",      "60s",  "Glúteo no topo"),
                    new("Panturrilha em Pé",     3, "20",      "45s",  "Amplitude total"),
                }),
            },

            WorkoutGoal.WeightLoss => new()
            {
                ("Circuito HIIT", new()
                {
                    new("Burpee",                3, "15",      "30s",  "Mantenha o ritmo"),
                    new("Mountain Climber",       3, "30s",     "30s",  "Core ativado"),
                    new("Polichinelo",            3, "45s",     "30s",  "Braços acima da cabeça"),
                    new("Agachamento com Salto",  3, "15",      "30s",  "Aterrissagem suave"),
                    new("Corrida no lugar",       3, "45s",     "30s",  "Joelhos altos"),
                }),
                ("Força Metabólica", new()
                {
                    new("Agachamento",            3, "15",      "45s",  "Movimento controlado"),
                    new("Flexão",                 3, "15",      "45s",  "Corpo alinhado"),
                    new("Remada com Haltere",     3, "15",      "45s",  "Costas retas"),
                    new("Afundo Alternado",       3, "12 cada", "45s",  "Passos amplos"),
                    new("Prancha",                3, "45s",     "30s",  "Quadril nivelado"),
                }),
                ("Cardio Resistência", new()
                {
                    new("Polichinelo",            2, "3 min",   "30s",  "Aquecimento"),
                    new("Step / Escada",          3, "3 min",   "60s",  "Cadência constante"),
                    new("Agachamento Sumo",       3, "20",      "30s",  "Posição ampla"),
                    new("Prancha com Rotação",    3, "10 cada", "30s",  "Rotação controlada"),
                    new("Jumping Jacks",          3, "45s",     "30s",  "Ritmo constante"),
                }),
            },

            WorkoutGoal.Endurance => new()
            {
                ("Resistência Aeróbica", new()
                {
                    new("Corrida Leve",           1, "20-30min","0s",   "Zona 2 — consegue falar"),
                    new("Mountain Climber",        3, "1 min",   "30s",  "Core ativo"),
                    new("Polichinelo",             3, "2 min",   "30s",  "Ritmo constante"),
                    new("Pular Corda",             3, "2 min",   "45s",  "Pés juntos ou alternados"),
                    new("Agachamento",             3, "20",      "30s",  "Alta repetição"),
                }),
                ("Força Funcional", new()
                {
                    new("Agachamento",             3, "20",      "45s",  "Alta repetição"),
                    new("Flexão",                  3, "20",      "45s",  "Ritmo moderado"),
                    new("Barra Fixa",              3, "Max",     "60s",  "Progresso gradual"),
                    new("Prancha",                 3, "1 min",   "30s",  "Isometria"),
                    new("Dead Bug",                3, "10 cada", "30s",  "Lombar no chão"),
                }),
            },

            WorkoutGoal.Flexibility => new()
            {
                ("Mobilidade e Alongamento", new()
                {
                    new("Cat-Cow",                2, "10",      "0s",   "Sincronize com a respiração"),
                    new("Hip Flexor Stretch",     2, "30s cada","0s",   "Quadril à frente"),
                    new("Torção Espinhal",        2, "30s cada","0s",   "Ombros no chão"),
                    new("Pigeon Pose",            2, "45s cada","0s",   "Quadril nivelado"),
                    new("Downward Dog",           2, "45s",     "0s",   "Calcanhares em direção ao chão"),
                }),
                ("Yoga e Core", new()
                {
                    new("Warrior I",              2, "30s cada","0s",   "Quadril de frente"),
                    new("Warrior II",             2, "30s cada","0s",   "Olhar para a mão da frente"),
                    new("Prancha",                3, "30-60s",  "30s",  "Core ativado"),
                    new("Side Plank",             3, "20s cada","30s",  "Quadril elevado"),
                    new("Child's Pose",           1, "2 min",   "0s",   "Descanso ativo"),
                }),
            },

            _ /* GeneralHealth */ => new()
            {
                ("Treino Completo A", new()
                {
                    new("Agachamento",            3, "12",      "60s",  "Postura ereta"),
                    new("Supino com Halteres",    3, "12",      "60s",  "Amplitude total"),
                    new("Remada com Haltere",     3, "12",      "60s",  "Cotovelo guia"),
                    new("Desenvolvimento",        3, "12",      "60s",  "Cotovelos à frente"),
                    new("Prancha",                3, "30-45s",  "45s",  "Respiração regular"),
                }),
                ("Treino Completo B", new()
                {
                    new("Leg Press",              3, "15",      "60s",  "Amplitude controlada"),
                    new("Puxada Frontal",         3, "12",      "60s",  "Puxe até o queixo"),
                    new("Flexão",                 3, "12-15",   "60s",  "Corpo alinhado"),
                    new("Elevação Lateral",       3, "15",      "60s",  "Cotovelos levemente flexionados"),
                    new("Abdominal Supra",        3, "20",      "45s",  "Expirar na subida"),
                }),
            }
        };
    }

    private static string[] GetDayNames(int count) => count switch
    {
        2 => ["Segunda", "Quinta"],
        3 => ["Segunda", "Quarta", "Sexta"],
        4 => ["Segunda", "Terça", "Quinta", "Sexta"],
        5 => ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
        6 => ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
        _ => ["Segunda"]
    };

    private static string WorkoutGoalLabel(WorkoutGoal goal) => goal switch
    {
        WorkoutGoal.MuscleGain  => "Hipertrofia",
        WorkoutGoal.WeightLoss  => "Perda de Peso",
        WorkoutGoal.Endurance   => "Resistência",
        WorkoutGoal.Flexibility => "Flexibilidade",
        _                       => "Saúde Geral"
    };

    // ──────────────────────────────────────────────────────────────
    // Diet building helpers
    // ──────────────────────────────────────────────────────────────
    private static DietGoal ParseDietGoal(string? goal)
    {
        return (goal?.ToLower() ?? string.Empty) switch
        {
            var g when g.Contains("emagrec") || g.Contains("perda") || g.Contains("weight") || g.Contains("loss") =>
                DietGoal.WeightLoss,
            var g when g.Contains("hipertrofia") || g.Contains("muscul") || g.Contains("gain") =>
                DietGoal.MuscleGain,
            var g when g.Contains("manutencao") || g.Contains("manutenção") || g.Contains("maintenance") =>
                DietGoal.WeightMaintenance,
            _ => DietGoal.HealthImprovement
        };
    }

    private static string DietGoalLabel(DietGoal goal) => goal switch
    {
        DietGoal.WeightLoss        => "Emagrecimento",
        DietGoal.MuscleGain        => "Hipertrofia",
        DietGoal.WeightMaintenance => "Manutenção de Peso",
        _                          => "Melhora da Saúde"
    };

    private static int CalcDailyCalories(User user, DietGoal goal)
    {
        double weight = user.Weight > 0 ? (double)user.Weight : 70.0;
        double height = user.Height > 0 ? (double)user.Height : 170.0;
        int age = user.BirthDate > DateTime.MinValue
            ? (int)((DateTime.UtcNow - user.BirthDate).TotalDays / 365.25)
            : 25;

        // Mifflin-St Jeor
        double bmr = user.Sex == UserSex.Female
            ? 10 * weight + 6.25 * height - 5 * age - 161
            : 10 * weight + 6.25 * height - 5 * age + 5;

        double tdee = bmr * 1.55; // moderate activity assumed

        return goal switch
        {
            DietGoal.WeightLoss        => (int)(tdee - 500),
            DietGoal.MuscleGain        => (int)(tdee + 300),
            DietGoal.WeightMaintenance => (int)tdee,
            _                          => (int)tdee
        };
    }

    private static List<Meal> BuildMeals(int dailyCal, AiGenerateDietDto dto)
    {
        var goal       = ParseDietGoal(dto.Goal);
        int meals      = Math.Clamp(dto.MealsPerDay, 3, 6);

        double proteinPct = goal == DietGoal.MuscleGain ? 0.30 : 0.25;
        double carbPct    = goal == DietGoal.WeightLoss  ? 0.35 : 0.45;
        double fatPct     = 1 - proteinPct - carbPct;

        // Distribute calories among meals proportionally
        var (times, labels, pcts) = meals switch
        {
            3 => (
                new[] { "07:00", "12:30", "19:30" },
                new[] { "Café da Manhã", "Almoço", "Jantar" },
                new[] { 0.25, 0.45, 0.30 }),
            4 => (
                new[] { "07:00", "12:30", "16:00", "19:30" },
                new[] { "Café da Manhã", "Almoço", "Lanche da Tarde", "Jantar" },
                new[] { 0.25, 0.35, 0.10, 0.30 }),
            5 => (
                new[] { "07:00", "10:00", "12:30", "16:00", "19:30" },
                new[] { "Café da Manhã", "Lanche da Manhã", "Almoço", "Lanche da Tarde", "Jantar" },
                new[] { 0.20, 0.10, 0.35, 0.10, 0.25 }),
            _ /* 6 */ => (
                new[] { "07:00", "09:30", "12:30", "15:30", "18:30", "21:00" },
                new[] { "Café da Manhã", "Lanche 1", "Almoço", "Lanche 2", "Jantar", "Ceia" },
                new[] { 0.20, 0.08, 0.30, 0.10, 0.25, 0.07 })
        };

        return Enumerable.Range(0, meals).Select(i =>
        {
            double p = pcts[i];
            return new Meal
            {
                Name     = labels[i],
                Time     = times[i],
                Calories = (int)(dailyCal * p),
                Proteins = Math.Round((decimal)(dailyCal * proteinPct * p / 4), 1),
                Carbs    = Math.Round((decimal)(dailyCal * carbPct    * p / 4), 1),
                Fats     = Math.Round((decimal)(dailyCal * fatPct     * p / 9), 1)
            };
        }).ToList();
    }
}
