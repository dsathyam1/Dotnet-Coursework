using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.DTOs.Appointment;

/// <summary>Used by staff/admin who know the target customer's ID.</summary>
public class CreateAppointmentDto
{
    [Required]
    public int CustomerId { get; set; }

    [Required]
    public int VehicleId { get; set; }

    [Required]
    public DateTime AppointmentDate { get; set; }

    [MaxLength(100)]
    public string? ServiceType { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

/// <summary>Used by the customer portal — no CustomerId needed (resolved from JWT).</summary>
public class CustomerCreateAppointmentDto
{
    [Required]
    public int VehicleId { get; set; }

    [Required]
    public DateTime AppointmentDate { get; set; }

    [MaxLength(100)]
    public string? ServiceType { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}
