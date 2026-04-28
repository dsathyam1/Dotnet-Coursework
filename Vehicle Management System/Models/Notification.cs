using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.Models;

public class Notification
{
    public int Id { get; set; }

    public int UserId { get; set; }

    [MaxLength(500)]
    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(50)]
    public string? Type { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
