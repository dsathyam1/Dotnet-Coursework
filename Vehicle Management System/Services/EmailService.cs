using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using Vehicle_Management_System.DTOs.SalesInvoice;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendInvoiceAsync(string toEmail, string customerName, SalesInvoiceResponseDto invoice)
    {
        var subject = $"Vehicle Management System — Invoice #{invoice.Id}";
        
        var itemsHtml = string.Join("", invoice.Items.Select(i => 
            $"<tr><td style='padding:12px;border-bottom:1px solid #e2e8f0;color:#334155;'>{i.PartName}</td><td style='padding:12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#475569;'>{i.Quantity}</td><td style='padding:12px;border-bottom:1px solid #e2e8f0;text-align:right;color:#475569;'>NPR {i.UnitSellingPrice:N2}</td><td style='padding:12px;border-bottom:1px solid #e2e8f0;text-align:right;color:#0f172a;font-weight:600;'>NPR {i.LineTotal:N2}</td></tr>"
        ));

        var body = $@"
            <div style='font-family:""Segoe UI"",Roboto,Helvetica,Arial,sans-serif; max-width:650px; margin:0 auto; padding:30px; border:1px solid #e2e8f0; border-radius:12px; background-color:#ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);'>
                <div style='text-align:center; margin-bottom:30px;'>
                    <h1 style='color:#0f172a; margin:0; font-size:24px;'>Vehicle Parts Center</h1>
                    <p style='color:#64748b; margin:5px 0 0 0; font-size:14px;'>Official Sales Invoice</p>
                </div>
                
                <h2 style='color:#1e293b; font-size:18px;'>Hello, {customerName}!</h2>
                <p style='color:#475569; line-height:1.6;'>Thank you for your recent purchase. Below is the detailed breakdown of your invoice <strong>#{invoice.Id}</strong>.</p>
                
                <table style='width:100%; border-collapse:collapse; margin-top:25px; margin-bottom:25px;'>
                    <thead>
                        <tr style='background-color:#f8fafc;'>
                            <th style='padding:12px;text-align:left;border-bottom:2px solid #e2e8f0;color:#64748b;font-weight:600;font-size:13px;text-transform:uppercase;'>Item / Service</th>
                            <th style='padding:12px;text-align:center;border-bottom:2px solid #e2e8f0;color:#64748b;font-weight:600;font-size:13px;text-transform:uppercase;'>Qty</th>
                            <th style='padding:12px;text-align:right;border-bottom:2px solid #e2e8f0;color:#64748b;font-weight:600;font-size:13px;text-transform:uppercase;'>Unit Price</th>
                            <th style='padding:12px;text-align:right;border-bottom:2px solid #e2e8f0;color:#64748b;font-weight:600;font-size:13px;text-transform:uppercase;'>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan='3' style='padding:15px 12px;text-align:right;font-weight:600;color:#475569;'>Grand Total:</td>
                            <td style='padding:15px 12px;text-align:right;font-weight:800;color:#059669;font-size:16px;'>NPR {invoice.TotalAmount:N2}</td>
                        </tr>
                    </tfoot>
                </table>
                
                <div style='margin-top:30px; padding-top:20px; border-top:1px dashed #cbd5e1; text-align:center;'>
                    <p style='color:#64748b; font-size:13px; margin:0;'>Thank you for choosing Vehicle Parts Center!</p>
                    <p style='color:#94a3b8; font-size:12px; margin:5px 0 0 0;'>If you have any questions regarding this invoice, please contact our support.</p>
                </div>
            </div>";

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendCreditReminderAsync(string toEmail, string customerName, decimal creditBalance)
    {
        var subject = "Vehicle Management System — Outstanding Credit Balance";
        var body    = $@"
            <h2>Hello, {customerName}!</h2>
            <p>This is a reminder that you have an outstanding credit balance of
               <strong>NPR {creditBalance:N2}</strong>.</p>
            <p>Please visit our workshop to settle your account at your earliest convenience.</p>";

        await SendEmailAsync(toEmail, subject, body);
    }

    private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        var smtp    = _config["EmailSettings:Host"];
        var port    = int.TryParse(_config["EmailSettings:Port"], out var p) ? p : 587;
        var sender  = _config["EmailSettings:FromEmail"];
        var password = _config["EmailSettings:Password"];
        var senderName = _config["EmailSettings:FromName"] ?? "Vehicle Management System";

        if (string.IsNullOrWhiteSpace(smtp) || string.IsNullOrWhiteSpace(sender))
        {
            _logger.LogWarning("Email settings not configured. Skipping email to {Email}.", toEmail);
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(senderName, sender));
        message.To.Add(new MailboxAddress(toEmail, toEmail));
        message.Subject = subject;
        message.Body    = new TextPart("html") { Text = htmlBody };

        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(smtp, port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(sender, password ?? string.Empty);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}.", toEmail);
        }
    }
}
