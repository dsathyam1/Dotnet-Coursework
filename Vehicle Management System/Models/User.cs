using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    public int RoleId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;

    // Navigation
    public Role Role { get; set; } = null!;
    public Staff? Staff { get; set; }
    public Customer? Customer { get; set; }
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
