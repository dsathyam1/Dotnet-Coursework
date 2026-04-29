namespace Vehicle_Management_System.DTOs.Appointment;

public class AppointmentResponseDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int VehicleId { get; set; }
    public string VehicleInfo { get; set; } = string.Empty;
    public string? NumberPlate { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string? ServiceType { get; set; }
    public string Status { get; set; } = "Pending";
    public string? Notes { get; set; }
}
