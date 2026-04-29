using Vehicle_Management_System.DTOs.Staff;

namespace Vehicle_Management_System.Services.Interfaces;

public interface IStaffService
{
    Task<List<StaffResponseDto>> GetAllStaffAsync();
    Task<StaffResponseDto> CreateStaffAsync(CreateStaffDto dto);
    Task<StaffResponseDto> UpdateStaffAsync(int id, UpdateStaffDto dto);
    Task<bool> DeactivateStaffAsync(int id);
}
