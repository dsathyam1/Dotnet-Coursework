using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.Models;

public class PartRequest
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    [MaxLength(100)]
    public string? PartName { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    // Navigation
    public Customer Customer { get; set; } = null!;
}
