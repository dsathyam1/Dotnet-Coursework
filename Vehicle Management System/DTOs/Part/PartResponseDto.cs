namespace Vehicle_Management_System.DTOs.Part;

public class PartResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public decimal SellingPrice { get; set; }
    public decimal CostPrice { get; set; }
    public int StockQuantity { get; set; }
    public bool IsLowStock => StockQuantity < 10;
    public int VendorId { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
