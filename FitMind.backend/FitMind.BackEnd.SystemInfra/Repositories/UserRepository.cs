using FitMind.BackEnd.SystemInfra.ContextDb;
using FitMind.BackEnd.SystemInfra.Entities;
using Microsoft.EntityFrameworkCore;

namespace FitMind.BackEnd.SystemInfra.Repositories;

public class UserRepository(AppDbContext context) : Repository<User>(context)
{
    public async Task<User?> GetByEmailAsync(string email) =>
        await _dbSet.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

    public async Task<User?> GetWithAchievementsAsync(Guid userId) =>
        await _dbSet
            .Include(u => u.UserAchievements)
                .ThenInclude(ua => ua.Achievement)
            .FirstOrDefaultAsync(u => u.Id == userId);

    public async Task<bool> ExistsByEmailAsync(string email) =>
        await _dbSet.AnyAsync(u => u.Email.ToLower() == email.ToLower());
}
