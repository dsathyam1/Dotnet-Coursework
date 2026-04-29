using Vehicle_Management_System.DTOs.SalesInvoice;

namespace Vehicle_Management_System.Services.Interfaces;

public interface ISalesInvoiceService
{
    Task<List<SalesInvoiceResponseDto>> GetAllAsync();
    Task<SalesInvoiceResponseDto> GetByIdAsync(int id);
    Task<SalesInvoiceResponseDto> CreateAsync(CreateSalesInvoiceDto dto, int staffUserId);
}
