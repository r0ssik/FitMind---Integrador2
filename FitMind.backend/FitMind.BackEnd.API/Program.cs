using System.Text;
using FitMind.BackEnd.IoC;
using FitMind.BackEnd.API.Extensions;
using FitMind.BackEnd.API.Jobs;
using FitMind.BackEnd.SystemInfra.ContextDb;
using FitMind.BackEnd.SystemInfra.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Quartz;

var builder = WebApplication.CreateBuilder(args);

// ── Controllers ───────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ── Swagger ───────────────────────────────────────────────────
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FitMind API",
        Version = "v1",
        Description = "API do FitMind — plataforma de fitness e bem-estar"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header. Exemplo: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// ── JWT Authentication ────────────────────────────────────────
var jwtKey = builder.Configuration["JwtSettings:SecretKey"]
    ?? throw new InvalidOperationException("JwtSettings:SecretKey not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// ── Infrastructure & Services (IoC) ──────────────────────────
builder.Services.AddInfrastructure(builder.Configuration);

// ── CORS ──────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("FitMindPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",
                "https://r0ssik.github.io")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ── Quartz (Jobs) ─────────────────────────────────────────────
builder.Services.AddQuartz(q =>
{
    var jobKey = new JobKey("RefreshTokenCleanUp");
    q.AddJob<RefreshTokenCleanUpJob>(opts => opts.WithIdentity(jobKey));
    q.AddTrigger(opts => opts
        .ForJob(jobKey)
        .WithIdentity("RefreshTokenCleanUp-trigger")
        .WithCronSchedule("0 0 3 * * ?"));   // every day at 03:00
});
builder.Services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

// ─────────────────────────────────────────────────────────────
var app = builder.Build();

// ── Migrations + Seed ─────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    await DbInitializer.SeedAsync(db);
}

// ── Middleware ────────────────────────────────────────────────
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "FitMind API v1"));

app.UseHttpsRedirection();
app.UseCors("FitMindPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
