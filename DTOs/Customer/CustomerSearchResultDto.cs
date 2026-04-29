using Vehicle_Management_System.DTOs.Vehicle;

namespace Vehicle_Management_System.DTOs.Customer;

public class CustomerSearchResultDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal CreditBalance { get; set; }
    public List<VehicleResponseDto> Vehicles { get; set; } = new();
}
