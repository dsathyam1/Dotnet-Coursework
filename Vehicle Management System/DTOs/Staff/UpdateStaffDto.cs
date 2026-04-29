using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.DTOs.Staff;

public class UpdateStaffDto
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string EmployeeCode { get; set; } = string.Empty;
}
