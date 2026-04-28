using Microsoft.EntityFrameworkCore;
using Vehicle_Management_System.Data;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Services;

public class CreditReminderBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<CreditReminderBackgroundService> _logger;

    public CreditReminderBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<CreditReminderBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Credit Reminder Background Service started.");

        // Run once shortly after startup, then on a daily schedule
        await RunReminderJobAsync();

        while (!stoppingToken.IsCancellationRequested)
        {
            // Calculate delay until next midnight UTC
            var now     = DateTime.UtcNow;
            var nextRun = now.Date.AddDays(1);
            var delay   = nextRun - now;

            _logger.LogInformation(
                "Credit reminder job scheduled for {NextRun} UTC ({Hours:F1}h away).",
                nextRun, delay.TotalHours);

            try
            {
                await Task.Delay(delay, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }

            await RunReminderJobAsync();
        }

        _logger.LogInformation("Credit Reminder Background Service stopping.");
    }

    private async Task RunReminderJobAsync()
    {
        _logger.LogInformation("Running credit reminder job at {Time} UTC.", DateTime.UtcNow);

        try
        {
            using var scope       = _scopeFactory.CreateScope();
            var context           = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var emailService      = scope.ServiceProvider.GetRequiredService<IEmailService>();

            var cutoff = DateTime.UtcNow.AddMonths(-1);

            var overdueCustomers = await context.Customers
                .Include(c => c.User)
                .Where(c => c.CreditBalance > 0 &&
                           (c.LastCreditPaidAt == null || c.LastCreditPaidAt < cutoff))
                .ToListAsync();

            _logger.LogInformation(
                "Found {Count} customer(s) with overdue credit balances.", overdueCustomers.Count);

            foreach (var customer in overdueCustomers)
            {
                try
                {
                    await emailService.SendCreditReminderAsync(
                        customer.User.Email,
                        customer.User.FullName,
                        customer.CreditBalance);

                    _logger.LogInformation(
                        "Credit reminder sent to {Email} (balance: {Balance:N2}).",
                        customer.User.Email, customer.CreditBalance);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Failed to send credit reminder to {Email}.", customer.User.Email);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled error during credit reminder job.");
        }
    }
}
