using Vehicle_Management_System.DTOs.Appointment;

namespace Vehicle_Management_System.Services.Interfaces;

public interface IAppointmentService
{
    Task<List<AppointmentResponseDto>> GetAllAsync();
    Task<List<AppointmentResponseDto>> GetByCustomerAsync(int customerId);
    Task<List<AppointmentResponseDto>> GetByCustomerUserIdAsync(int userId);
    Task<AppointmentResponseDto> GetByIdAsync(int id);
    Task<AppointmentResponseDto> CreateAsync(CreateAppointmentDto dto);
    Task<AppointmentResponseDto> CreateByUserIdAsync(int userId, CustomerCreateAppointmentDto dto);
    Task<AppointmentResponseDto> UpdateStatusAsync(int id, string status);
    Task DeleteAsync(int id);
}
