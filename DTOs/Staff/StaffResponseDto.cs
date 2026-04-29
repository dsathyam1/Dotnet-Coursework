namespace Vehicle_Management_System.DTOs.Staff;

public class StaffResponseDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? EmployeeCode { get; set; }
    public string? Department { get; set; }
    public DateTime JoinedAt { get; set; }
    public bool IsActive { get; set; }
}
