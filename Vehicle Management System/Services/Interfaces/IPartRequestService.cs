using Vehicle_Management_System.DTOs.PartRequest;

namespace Vehicle_Management_System.Services.Interfaces;

public interface IPartRequestService
{
    Task<List<PartRequestResponseDto>> GetAllAsync();
    Task<List<PartRequestResponseDto>> GetByCustomerAsync(int customerId);
    Task<List<PartRequestResponseDto>> GetByCustomerUserIdAsync(int userId);
    Task<PartRequestResponseDto> CreateAsync(int customerId, CreatePartRequestDto dto);
    Task<PartRequestResponseDto> CreateByUserIdAsync(int userId, CreatePartRequestDto dto);
    Task<PartRequestResponseDto> UpdateStatusAsync(int id, string status);
}
