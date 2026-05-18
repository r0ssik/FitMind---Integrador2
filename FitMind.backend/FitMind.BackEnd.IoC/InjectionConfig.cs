using FitMind.BackEnd.Service.Interfaces;
using FitMind.BackEnd.Service.Services;
using FitMind.BackEnd.SystemInfra.ContextDb;
using FitMind.BackEnd.SystemInfra.Repositories;
using FitMind.BackEnd.SystemInfra.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FitMind.BackEnd.IoC;

public static class InjectionConfig
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── Database ──────────────────────────────────────────────
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        // ── Repositories ──────────────────────────────────────────
        services.AddScoped<UserRepository>();
        services.AddScoped(typeof(SystemInfra.Interfaces.IRepository<>),
                           typeof(SystemInfra.Repositories.Repository<>));

        // ── Security ──────────────────────────────────────────────
        services.AddScoped<TokenService>();

        // ── Auth & User ───────────────────────────────────────────
        services.AddScoped<IAuthService,         AuthService>();
        services.AddScoped<IUserService,         UserService>();

        // ── Workout & Diet ────────────────────────────────────────
        services.AddScoped<IWorkoutService,      WorkoutService>();
        services.AddScoped<IDietService,         DietService>();

        // ── Social & Notifications ────────────────────────────────
        services.AddScoped<ISocialService,       SocialService>();
        services.AddScoped<INotificationService, NotificationService>();

        // ── Challenges & Achievements ─────────────────────────────
        services.AddScoped<IChallengeService,    ChallengeService>();
        services.AddScoped<IAchievementService,  AchievementService>();

        // ── Body & Progress ───────────────────────────────────────
        services.AddScoped<IMeasurementService,  MeasurementService>();
        services.AddScoped<IProgressService,     ProgressService>();

        // ── History & Profile ─────────────────────────────────────
        services.AddScoped<IHistoryService,      HistoryService>();
        services.AddScoped<IProfileService,      ProfileService>();

        // ── Settings ──────────────────────────────────────────────
        services.AddScoped<ISettingsService,     SettingsService>();

        // ── Admin ─────────────────────────────────────────────────
        services.AddScoped<IAdminService,        AdminService>();

        // ── Water & Food ──────────────────────────────────────────
        services.AddScoped<IWaterService,        WaterService>();
        services.AddScoped<IFoodService,         FoodService>();

        // ── AI Generator ──────────────────────────────────────────
        services.AddScoped<IAiGeneratorService,  AiGeneratorService>();

        return services;
    }
}
