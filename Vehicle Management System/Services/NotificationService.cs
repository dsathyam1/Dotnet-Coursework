using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Vehicle_Management_System.Data;
using Vehicle_Management_System.DTOs.Notification;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Services;

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public NotificationService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<NotificationResponseDto>> GetUnreadAsync(int userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<NotificationResponseDto>>(notifications);
    }

    public async Task<NotificationResponseDto> MarkAsReadAsync(int notificationId, int userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId)
            ?? throw new KeyNotFoundException($"Notification with ID {notificationId} not found.");

        notification.IsRead = true;
        await _context.SaveChangesAsync();

        return _mapper.Map<NotificationResponseDto>(notification);
    }
}
