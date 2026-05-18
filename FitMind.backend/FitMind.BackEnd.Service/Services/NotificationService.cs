using FitMind.BackEnd.Service.Interfaces;
using FitMind.BackEnd.SystemInfra.ContextDb;
using FitMind.BackEnd.SystemInfra.Entities;
using FitMind.BackEnd.SystemInfra.Enums;
using Microsoft.EntityFrameworkCore;

namespace FitMind.BackEnd.Service.Services;

public class NotificationService(AppDbContext context) : INotificationService
{
    public async Task<IEnumerable<Notification>> GetByUserAsync(Guid userId) =>
        await context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

    public async Task MarkAsReadAsync(Guid notificationId, Guid userId)
    {
        await context.Notifications
            .Where(n => n.Id == notificationId && n.UserId == userId)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        await context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
    }

    public async Task CreateAsync(Guid userId, NotificationType type, string title, string body)
    {
        await context.Notifications.AddAsync(new Notification
        {
            UserId = userId,
            Type = type,
            Title = title,
            Body = body
        });
        await context.SaveChangesAsync();
    }
}
