using Vehicle_Management_System.DTOs.Notification;

namespace Vehicle_Management_System.Services.Interfaces;

public interface INotificationService
{
    Task<List<NotificationResponseDto>> GetUnreadAsync(int userId);
    Task<NotificationResponseDto> MarkAsReadAsync(int notificationId, int userId);
}
