using Microsoft.EntityFrameworkCore;
using Vehicle_Management_System.Data;
using Vehicle_Management_System.DTOs.Report;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Services;

public class ReportService : IReportService
{
    private readonly ApplicationDbContext _context;

    public ReportService(ApplicationDbContext context)
    {
        _context = context;
    }

    // ── Financial Report ──────────────────────────────────────────────────────
    public async Task<FinancialReportDto> GetFinancialReportAsync(string period)
    {
        var (from, to) = GetDateRange(period);

        // Revenue: sum of paid sales invoices in range
        var revenue = await _context.SalesInvoices
            .Where(i => i.IsPaid && i.SaleDate >= from && i.SaleDate <= to)
            .SumAsync(i => (decimal?)i.TotalAmount) ?? 0m;

        // Transaction count
        var txCount = await _context.SalesInvoices
            .CountAsync(i => i.IsPaid && i.SaleDate >= from && i.SaleDate <= to);

        // Cost: sum of purchase invoices in range
        var cost = await _context.PurchaseInvoices
            .Where(i => i.PurchaseDate >= from && i.PurchaseDate <= to)
            .SumAsync(i => (decimal?)i.TotalAmount) ?? 0m;

        // Top 5 selling parts by quantity
        var topParts = await _context.SalesInvoiceItems
            .Where(item => item.SalesInvoice.IsPaid
                        && item.SalesInvoice.SaleDate >= from
                        && item.SalesInvoice.SaleDate <= to)
            .GroupBy(item => new { item.PartId, item.Part.Name })
            .Select(g => new TopSellingPartDto
            {
                PartId            = g.Key.PartId,
                PartName          = g.Key.Name,
                TotalQuantitySold = g.Sum(i => i.Quantity),
                TotalRevenue      = g.Sum(i => i.Quantity * i.UnitSellingPrice)
            })
            .OrderByDescending(p => p.TotalQuantitySold)
            .Take(5)
            .ToListAsync();

        return new FinancialReportDto
        {
            Period           = period.ToLower(),
            From             = from,
            To               = to,
            TotalRevenue     = revenue,
            TotalCost        = cost,
            Profit           = revenue - cost,
            TransactionCount = txCount,
            TopSellingParts  = topParts
        };
    }

    // ── Top 10 Spenders ───────────────────────────────────────────────────────
    public async Task<List<TopSpenderDto>> GetTopSpendersAsync()
    {
        return await _context.Customers
            .Include(c => c.User)
            .OrderByDescending(c => c.TotalSpent)
            .Take(10)
            .Select(c => new TopSpenderDto
            {
                CustomerId = c.Id,
                FullName   = c.User.FullName,
                Email      = c.User.Email,
                Phone      = c.User.Phone,
                TotalSpent = c.TotalSpent
            })
            .ToListAsync();
    }

    // ── Regular Customers (≥ 3 purchases) ────────────────────────────────────
    public async Task<List<RegularCustomerDto>> GetRegularCustomersAsync()
    {
        // Group invoices per customer first, then join with customers
        var invoiceCounts = await _context.SalesInvoices
            .GroupBy(i => i.CustomerId)
            .Where(g => g.Count() >= 3)
            .Select(g => new { CustomerId = g.Key, Count = g.Count() })
            .ToListAsync();

        var customerIds = invoiceCounts.Select(x => x.CustomerId).ToList();

        var customers = await _context.Customers
            .Include(c => c.User)
            .Where(c => customerIds.Contains(c.Id))
            .ToListAsync();

        return customers
            .Select(c => new RegularCustomerDto
            {
                CustomerId    = c.Id,
                FullName      = c.User.FullName,
                Email         = c.User.Email,
                PurchaseCount = invoiceCounts.First(x => x.CustomerId == c.Id).Count,
                TotalSpent    = c.TotalSpent
            })
            .OrderByDescending(c => c.PurchaseCount)
            .ToList();
    }

    // ── Pending Credits (overdue > 1 month) ───────────────────────────────────
    public async Task<List<PendingCreditDto>> GetPendingCreditsAsync()
    {
        var cutoff = DateTime.UtcNow.AddMonths(-1);

        return await _context.Customers
            .Include(c => c.User)
            .Where(c => c.CreditBalance > 0 &&
                       (c.LastCreditPaidAt == null || c.LastCreditPaidAt < cutoff))
            .OrderByDescending(c => c.CreditBalance)
            .Select(c => new PendingCreditDto
            {
                CustomerId      = c.Id,
                FullName        = c.User.FullName,
                Email           = c.User.Email,
                Phone           = c.User.Phone,
                CreditBalance   = c.CreditBalance,
                LastCreditPaidAt = c.LastCreditPaidAt,
                DaysOverdue     = c.LastCreditPaidAt == null
                    ? 9999
                    : (int)(DateTime.UtcNow - c.LastCreditPaidAt.Value).TotalDays
            })
            .ToListAsync();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private static (DateTime from, DateTime to) GetDateRange(string period)
    {
        var now = DateTime.UtcNow;
        return period.ToLower() switch
        {
            "daily"   => (now.Date, now.Date.AddDays(1).AddTicks(-1)),
            "monthly" => (new DateTime(now.Year, now.Month, 1),
                          new DateTime(now.Year, now.Month, 1).AddMonths(1).AddTicks(-1)),
            "yearly"  => (new DateTime(now.Year, 1, 1),
                          new DateTime(now.Year + 1, 1, 1).AddTicks(-1)),
            _ => throw new ArgumentException("Period must be 'daily', 'monthly', or 'yearly'.")
        };
    }
}
