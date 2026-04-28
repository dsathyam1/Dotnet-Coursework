namespace Vehicle_Management_System.DTOs.Notification;

public class NotificationResponseDto
{
    public int Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Type { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
