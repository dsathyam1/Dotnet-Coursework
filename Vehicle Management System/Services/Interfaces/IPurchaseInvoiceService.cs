using Vehicle_Management_System.DTOs.PurchaseInvoice;

namespace Vehicle_Management_System.Services.Interfaces;

public interface IPurchaseInvoiceService
{
    Task<List<PurchaseInvoiceResponseDto>> GetAllAsync();
    Task<PurchaseInvoiceResponseDto> GetByIdAsync(int id);
    Task<PurchaseInvoiceResponseDto> CreateAsync(CreatePurchaseInvoiceDto dto, int adminUserId);
}
