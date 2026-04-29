using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.DTOs.PartRequest;

public class CreatePartRequestDto
{
    [Required]
    [MaxLength(100)]
    public string PartName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }
}
