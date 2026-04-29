using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.DTOs.Auth;

public class UpdateProfileDto
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }
}
