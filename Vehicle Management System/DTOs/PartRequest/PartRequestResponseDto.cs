namespace Vehicle_Management_System.DTOs.PartRequest;

public class PartRequestResponseDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string? PartName { get; set; }
    public string? Description { get; set; }
    public DateTime RequestedAt { get; set; }
    public string Status { get; set; } = "Pending";
}
