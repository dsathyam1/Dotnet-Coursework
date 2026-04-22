using Vehicle_Management_System.DTOs.Customer;
using Vehicle_Management_System.DTOs.Vehicle;

namespace Vehicle_Management_System.Services.Interfaces;

public interface ICustomerService
{
    Task<List<CustomerListDto>> GetAllAsync();
    Task<CustomerDetailDto> GetByIdAsync(int id);
    Task<CustomerDetailDto> GetByUserIdAsync(int userId);  // for customer self-access
    Task<List<CustomerSearchResultDto>> SearchAsync(string query);
    Task<CustomerDetailDto> CreateAsync(CreateCustomerDto dto);
    Task<CustomerDetailDto> UpdateAsync(int id, UpdateCustomerDto dto);
    Task<VehicleResponseDto> AddVehicleAsync(int customerId, VehicleDto dto);
    Task<VehicleResponseDto> AddVehicleByUserIdAsync(int userId, VehicleDto dto);
    Task DeleteVehicleAsync(int customerId, int vehicleId);
    Task DeleteVehicleByUserIdAsync(int userId, int vehicleId);
    Task<VehicleResponseDto> UpdateVehicleAsync(int customerId, int vehicleId, VehicleDto dto);
}
