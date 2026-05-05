using Vehicle_Management_System.DTOs.SalesInvoice;

namespace Vehicle_Management_System.Services.Interfaces;

public interface ISalesInvoiceService
{
    Task<List<SalesInvoiceResponseDto>> GetAllAsync();
    Task<List<SalesInvoiceResponseDto>> GetByCustomerAsync(int customerId);
    Task<SalesInvoiceResponseDto> GetByIdAsync(int id);
    Task<SalesInvoiceResponseDto> CreateAsync(CreateSalesInvoiceDto dto, int staffId);
    Task<SalesInvoiceResponseDto> MarkAsPaidAsync(int id);
}
