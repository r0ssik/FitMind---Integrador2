using FitMind.BackEnd.Service.Dtos.Notification;
using FitMind.BackEnd.SystemInfra.Enums;

namespace FitMind.BackEnd.Service.Interfaces;

public interface INotificationService
{
    Task<IEnumerable<NotificationDto>> GetByUserAsync(Guid userId);
    Task MarkAsReadAsync(Guid notificationId, Guid userId);
    Task MarkAllAsReadAsync(Guid userId);
    Task CreateAsync(Guid userId, NotificationType type, string title, string body);
}
