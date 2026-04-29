using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.DTOs.Appointment;

public class CreateAppointmentDto
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
