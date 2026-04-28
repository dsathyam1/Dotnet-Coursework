using Vehicle_Management_System.DTOs.Report;

namespace Vehicle_Management_System.Services.Interfaces;

public interface IReportService
{
    Task<FinancialReportDto> GetFinancialReportAsync(string period);
    Task<List<TopSpenderDto>> GetTopSpendersAsync();
    Task<List<RegularCustomerDto>> GetRegularCustomersAsync();
    Task<List<PendingCreditDto>> GetPendingCreditsAsync();
}
