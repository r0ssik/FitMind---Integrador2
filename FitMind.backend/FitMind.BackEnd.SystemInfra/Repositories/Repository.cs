using System.Linq.Expressions;
using FitMind.BackEnd.SystemInfra.Base;
using FitMind.BackEnd.SystemInfra.ContextDb;
using FitMind.BackEnd.SystemInfra.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FitMind.BackEnd.SystemInfra.Repositories;

public class Repository<T>(AppDbContext context) : IRepository<T> where T : BaseEntity
{
    protected readonly AppDbContext _context = context;
    protected readonly DbSet<T> _dbSet = context.Set<T>();

    public async Task<T?> GetByIdAsync(Guid id) =>
        await _dbSet.FindAsync(id);

    public async Task<IEnumerable<T>> GetAllAsync() =>
        await _dbSet.ToListAsync();

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate) =>
        await _dbSet.Where(predicate).ToListAsync();

    public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate) =>
        await _dbSet.FirstOrDefaultAsync(predicate);

    public async Task AddAsync(T entity) =>
        await _dbSet.AddAsync(entity);

    public void Update(T entity) =>
        _dbSet.Update(entity);

    public void Remove(T entity) =>
        _dbSet.Remove(entity);

    public async Task SaveChangesAsync() =>
        await _context.SaveChangesAsync();
}
