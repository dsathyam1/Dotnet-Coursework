using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.Models;

public class Review
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public int Rating { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Customer Customer { get; set; } = null!;
}
