using Vehicle_Management_System.DTOs.PartRequest;

namespace Vehicle_Management_System.Services.Interfaces;

public interface IPartRequestService
{
    Task<List<PartRequestResponseDto>> GetMyRequestsAsync(int customerId);
    Task<PartRequestResponseDto> SubmitAsync(int customerId, CreatePartRequestDto dto);
}
