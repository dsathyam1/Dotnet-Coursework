using System.ComponentModel.DataAnnotations;
using Vehicle_Management_System.DTOs.Vehicle;

namespace Vehicle_Management_System.DTOs.Customer;

/// <summary>
/// DTO used by staff to register a new customer with optional vehicles.
/// </summary>
public class CreateCustomerDto
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    /// <summary>
    /// Optional: initial vehicle(s) to register for this customer.
    /// Each vehicle can include "licensePlate" from the frontend.
    /// </summary>
    public List<VehicleDto> Vehicles { get; set; } = new();
}
