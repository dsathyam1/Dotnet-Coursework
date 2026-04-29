using Vehicle_Management_System.DTOs.Vendor;

namespace Vehicle_Management_System.Services.Interfaces;

public interface IVendorService
{
    Task<List<VendorResponseDto>> GetAllAsync();
    Task<VendorResponseDto> GetByIdAsync(int id);
    Task<VendorResponseDto> CreateAsync(VendorDto dto);
    Task<VendorResponseDto> UpdateAsync(int id, VendorDto dto);
    Task DeleteAsync(int id);
}
