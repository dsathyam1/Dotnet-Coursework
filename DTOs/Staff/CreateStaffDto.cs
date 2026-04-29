using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.DTOs.Staff;

public class CreateStaffDto
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(20)]
    public string? EmployeeCode { get; set; }

    [MaxLength(50)]
    public string? Department { get; set; }

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
