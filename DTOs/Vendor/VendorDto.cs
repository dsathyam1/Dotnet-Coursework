using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.DTOs.Vendor;

public class VendorDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? ContactPerson { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(100)]
    [EmailAddress]
    public string? Email { get; set; }

    [MaxLength(200)]
    public string? Address { get; set; }
}
