using FitMind.BackEnd.SystemInfra.ContextDb;
using Microsoft.EntityFrameworkCore;
using Quartz;

namespace FitMind.BackEnd.API.Jobs;

[DisallowConcurrentExecution]
public class RefreshTokenCleanUpJob(AppDbContext context, ILogger<RefreshTokenCleanUpJob> logger) : IJob
{
    public async Task Execute(IJobExecutionContext jobContext)
    {
        logger.LogInformation("Running RefreshToken cleanup job at {Time}", DateTime.UtcNow);

        var deleted = await context.RefreshTokens
            .Where(t => t.IsRevoked || t.ExpiresAt < DateTime.UtcNow)
            .ExecuteDeleteAsync();

        logger.LogInformation("Deleted {Count} expired/revoked refresh tokens.", deleted);
    }
}
