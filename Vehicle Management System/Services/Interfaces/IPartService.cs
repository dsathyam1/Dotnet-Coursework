using Vehicle_Management_System.DTOs.Part;

namespace Vehicle_Management_System.Services.Interfaces;

public interface IPartService
{
    Task<List<PartResponseDto>> GetAllAsync();
    Task<PartResponseDto> GetByIdAsync(int id);
    Task<PartResponseDto> CreateAsync(PartDto dto);
    Task<PartResponseDto> UpdateAsync(int id, PartDto dto);
    Task DeleteAsync(int id);
}
