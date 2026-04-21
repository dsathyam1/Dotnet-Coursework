using Vehicle_Management_System.DTOs.SalesInvoice;

namespace Vehicle_Management_System.Services.Interfaces;

public interface IEmailService
{
    Task SendInvoiceAsync(string toEmail, string customerName, SalesInvoiceResponseDto invoice);
    Task SendCreditReminderAsync(string toEmail, string customerName, decimal creditBalance);
}
