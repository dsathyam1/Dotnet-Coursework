using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.Models;

public class Appointment
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public int VehicleId { get; set; }

    public DateTime AppointmentDate { get; set; }

    [MaxLength(100)]
    public string? ServiceType { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    [MaxLength(500)]
    public string? Notes { get; set; }

    // Navigation
    public Customer Customer { get; set; } = null!;
    public Vehicle Vehicle { get; set; } = null!;
}
