using Vehicle_Management_System.DTOs.Appointment;

namespace Vehicle_Management_System.Services.Interfaces;

public interface IAppointmentService
{
    Task<List<AppointmentResponseDto>> GetMyAppointmentsAsync(int customerId);
    Task<AppointmentResponseDto> BookAsync(int customerId, CreateAppointmentDto dto);
    Task CancelAsync(int appointmentId, int customerId);
}
