using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.DTOs.Staff;

public class UpdateStaffDto
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(20)]
    public string? EmployeeCode { get; set; }

    [MaxLength(50)]
    public string? Department { get; set; }
}
