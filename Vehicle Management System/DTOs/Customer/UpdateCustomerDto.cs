using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.DTOs.Customer;

public class UpdateCustomerDto
{
    [MaxLength(100)]
    public string? FullName { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    public bool? IsActive { get; set; }
}
