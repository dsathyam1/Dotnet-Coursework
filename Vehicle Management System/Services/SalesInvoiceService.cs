using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Vehicle_Management_System.Data;
using Vehicle_Management_System.DTOs.SalesInvoice;
using Vehicle_Management_System.Models;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Services;

public class SalesInvoiceService : ISalesInvoiceService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    private const int LowStockThreshold = 10;
    private const decimal DiscountThreshold = 5000m;
    private const decimal DiscountRate = 0.10m;

    public SalesInvoiceService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    // ── List all invoices ─────────────────────────────────────────────────────
    public async Task<List<SalesInvoiceResponseDto>> GetAllAsync()
    {
        var invoices = await _context.SalesInvoices
            .Include(i => i.Customer).ThenInclude(c => c.User)
            .Include(i => i.Staff).ThenInclude(s => s.User)
            .Include(i => i.SalesInvoiceItems).ThenInclude(item => item.Part)
            .OrderByDescending(i => i.SaleDate)
            .ToListAsync();

        return _mapper.Map<List<SalesInvoiceResponseDto>>(invoices);
    }

    // ── Get invoice detail ────────────────────────────────────────────────────
    public async Task<SalesInvoiceResponseDto> GetByIdAsync(int id)
    {
        var invoice = await _context.SalesInvoices
            .Include(i => i.Customer).ThenInclude(c => c.User)
            .Include(i => i.Staff).ThenInclude(s => s.User)
            .Include(i => i.SalesInvoiceItems).ThenInclude(item => item.Part)
            .FirstOrDefaultAsync(i => i.Id == id)
            ?? throw new KeyNotFoundException($"Sales invoice with ID {id} not found.");

        return _mapper.Map<SalesInvoiceResponseDto>(invoice);
    }

    // ── Create invoice ────────────────────────────────────────────────────────
    public async Task<SalesInvoiceResponseDto> CreateAsync(CreateSalesInvoiceDto dto, int staffUserId)
    {
        // Resolve staff record from the logged-in user
        var staff = await _context.Staff
            .FirstOrDefaultAsync(s => s.UserId == staffUserId)
            ?? throw new InvalidOperationException("No staff record found for the current user.");

        // Validate customer
        var customer = await _context.Customers
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == dto.CustomerId)
            ?? throw new KeyNotFoundException($"Customer with ID {dto.CustomerId} not found.");

        // Load all required parts in one query
        var partIds = dto.Items.Select(i => i.PartId).Distinct().ToList();
        var parts = await _context.Parts
            .Where(p => partIds.Contains(p.Id))
            .ToListAsync();

        // Validate: all parts exist
        var missingId = partIds.FirstOrDefault(id => parts.All(p => p.Id != id));
        if (missingId != 0)
            throw new KeyNotFoundException($"Part with ID {missingId} not found.");

        // Validate: sufficient stock for each line item
        foreach (var itemDto in dto.Items)
        {
            var part = parts.First(p => p.Id == itemDto.PartId);
            if (part.StockQuantity < itemDto.Quantity)
                throw new InvalidOperationException(
                    $"Insufficient stock for '{part.Name}'. " +
                    $"Available: {part.StockQuantity}, Requested: {itemDto.Quantity}.");
        }

        // Build line items and calculate subtotal
        decimal subtotal = 0;
        var invoiceItems = new List<SalesInvoiceItem>();

        foreach (var itemDto in dto.Items)
        {
            var part = parts.First(p => p.Id == itemDto.PartId);
            part.StockQuantity -= itemDto.Quantity;
            subtotal += itemDto.Quantity * part.SellingPrice;

            invoiceItems.Add(new SalesInvoiceItem
            {
                PartId           = part.Id,
                Quantity         = itemDto.Quantity,
                UnitSellingPrice = part.SellingPrice
            });
        }

        // Loyalty discount: 10% off when subtotal > 5000
        var discountApplied = subtotal > DiscountThreshold;
        var totalAmount     = discountApplied ? subtotal * (1 - DiscountRate) : subtotal;

        // Build invoice
        var invoice = new SalesInvoice
        {
            CustomerId       = dto.CustomerId,
            StaffId          = staff.Id,
            TotalAmount      = totalAmount,
            DiscountApplied  = discountApplied,
            SaleDate         = DateTime.UtcNow,
            IsPaid           = !dto.IsCreditSale,
            IsCreditSale     = dto.IsCreditSale,
            SalesInvoiceItems = invoiceItems
        };

        // Update customer financials
        customer.TotalSpent += totalAmount;
        if (dto.IsCreditSale)
            customer.CreditBalance += totalAmount;

        _context.SalesInvoices.Add(invoice);
        await _context.SaveChangesAsync();

        // Notify admins for any parts that dropped below threshold
        await NotifyLowStockAsync(parts);

        // Reload full graph for mapping
        await _context.Entry(invoice).Reference(i => i.Customer)
            .Query().Include(c => c.User).LoadAsync();
        await _context.Entry(invoice).Reference(i => i.Staff)
            .Query().Include(s => s.User).LoadAsync();
        foreach (var item in invoice.SalesInvoiceItems)
            await _context.Entry(item).Reference(i => i.Part).LoadAsync();

        return _mapper.Map<SalesInvoiceResponseDto>(invoice);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private async Task NotifyLowStockAsync(List<Part> parts)
    {
        var lowStockParts = parts.Where(p => p.StockQuantity < LowStockThreshold).ToList();
        if (!lowStockParts.Any()) return;

        var adminRoleId = await _context.Roles
            .Where(r => r.Name == "Admin")
            .Select(r => r.Id)
            .FirstOrDefaultAsync();

        if (adminRoleId == 0) return;

        var adminUserIds = await _context.Users
            .Where(u => u.RoleId == adminRoleId && u.IsActive)
            .Select(u => u.Id)
            .ToListAsync();

        // Collect part IDs that already have an unread notification to avoid duplicates
        var alreadyNotifiedPartPatterns = lowStockParts.Select(p => $"Part #{p.Id})").ToList();
        var existingNotifications = await _context.Notifications
            .Where(n => n.Type == "LowStock" && !n.IsRead)
            .ToListAsync();

        var notifications = new List<Notification>();

        foreach (var part in lowStockParts)
        {
            var pattern = $"Part #{part.Id})";
            foreach (var adminId in adminUserIds)
            {
                var alreadyExists = existingNotifications.Any(n =>
                    n.UserId == adminId && n.Message.Contains(pattern));

                if (!alreadyExists)
                {
                    notifications.Add(new Notification
                    {
                        UserId    = adminId,
                        Message   = $"Low stock alert: Part '{part.Name}' (Part #{part.Id}) has only {part.StockQuantity} unit(s) remaining.",
                        Type      = "LowStock",
                        IsRead    = false,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
        }

        if (notifications.Any())
        {
            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();
        }
    }
}
