using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.DTOs.Auth;

public class UpdateProfileDto
{
    [MaxLength(100)]
    public string? FullName { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }
}

public class ChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = string.Empty;
}
