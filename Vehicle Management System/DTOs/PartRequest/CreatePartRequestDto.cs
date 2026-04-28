using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.DTOs.PartRequest;

public class CreatePartRequestDto
{
    [MaxLength(100)]
    public string? PartName { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }
}
