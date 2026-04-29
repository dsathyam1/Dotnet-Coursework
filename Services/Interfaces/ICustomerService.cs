using Vehicle_Management_System.DTOs.Customer;
using Vehicle_Management_System.DTOs.SalesInvoice;
using Vehicle_Management_System.DTOs.Vehicle;

namespace Vehicle_Management_System.Services.Interfaces;

public interface ICustomerService
{
    Task<List<CustomerListDto>> GetAllAsync();
    Task<CustomerDetailDto> GetByIdAsync(int id);
    Task<CustomerDetailDto> CreateAsync(CreateCustomerDto dto);
    Task<CustomerDetailDto> UpdateAsync(int id, UpdateCustomerDto dto);
    Task<List<VehicleResponseDto>> GetVehiclesAsync(int customerId);
    Task<VehicleResponseDto> AddVehicleAsync(int customerId, VehicleDto dto);
    Task<List<SalesInvoiceResponseDto>> GetInvoicesAsync(int customerId);
    Task<List<CustomerSearchResultDto>> SearchAsync(string term);
    Task<int> GetCustomerIdByUserIdAsync(int userId);
}
