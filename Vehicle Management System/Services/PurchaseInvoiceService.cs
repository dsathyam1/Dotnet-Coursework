using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Vehicle_Management_System.Data;
using Vehicle_Management_System.DTOs.PurchaseInvoice;
using Vehicle_Management_System.Models;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Services;

public class PurchaseInvoiceService : IPurchaseInvoiceService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    private const int LowStockThreshold = 10;

    public PurchaseInvoiceService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<PurchaseInvoiceResponseDto>> GetAllAsync()
    {
        var invoices = await _context.PurchaseInvoices
            .Include(i => i.Vendor)
            .Include(i => i.PurchaseInvoiceItems)
                .ThenInclude(item => item.Part)
            .OrderByDescending(i => i.PurchaseDate)
            .ToListAsync();

        return _mapper.Map<List<PurchaseInvoiceResponseDto>>(invoices);
    }

    public async Task<PurchaseInvoiceResponseDto> GetByIdAsync(int id)
    {
        var invoice = await _context.PurchaseInvoices
            .Include(i => i.Vendor)
            .Include(i => i.PurchaseInvoiceItems)
                .ThenInclude(item => item.Part)
            .FirstOrDefaultAsync(i => i.Id == id)
            ?? throw new KeyNotFoundException($"Purchase invoice with ID {id} not found.");

        return _mapper.Map<PurchaseInvoiceResponseDto>(invoice);
    }

    public async Task<PurchaseInvoiceResponseDto> CreateAsync(CreatePurchaseInvoiceDto dto, int adminUserId)
    {
        // Validate vendor
        var vendor = await _context.Vendors.FindAsync(dto.VendorId)
            ?? throw new KeyNotFoundException($"Vendor with ID {dto.VendorId} not found.");

        // Validate all parts exist and snapshot their pre-purchase stock
        var partIds = dto.Items.Select(i => i.PartId).Distinct().ToList();
        var parts = await _context.Parts
            .Where(p => partIds.Contains(p.Id))
            .ToListAsync();

        var missingPartId = partIds.FirstOrDefault(id => parts.All(p => p.Id != id));
        if (missingPartId != 0)
            throw new KeyNotFoundException($"Part with ID {missingPartId} not found.");

        // Snapshot stock levels before restocking (for notification resolution)
        var stockBefore = parts.ToDictionary(p => p.Id, p => p.StockQuantity);

        // Build invoice
        decimal totalAmount = 0;
        var invoiceItems = new List<PurchaseInvoiceItem>();

        foreach (var itemDto in dto.Items)
        {
            var part = parts.First(p => p.Id == itemDto.PartId);
            part.StockQuantity += itemDto.Quantity;
            totalAmount += itemDto.Quantity * itemDto.UnitCostPrice;

            invoiceItems.Add(new PurchaseInvoiceItem
            {
                PartId        = itemDto.PartId,
                Quantity      = itemDto.Quantity,
                UnitCostPrice = itemDto.UnitCostPrice
            });
        }

        var invoice = new PurchaseInvoice
        {
            VendorId          = dto.VendorId,
            TotalAmount       = totalAmount,
            PurchaseDate      = DateTime.UtcNow,
            CreatedByAdminId  = adminUserId,
            PurchaseInvoiceItems = invoiceItems
        };

        _context.PurchaseInvoices.Add(invoice);
        await _context.SaveChangesAsync();

        // Resolve LowStock notifications for parts that are now above threshold
        foreach (var part in parts)
        {
            if (stockBefore[part.Id] < LowStockThreshold && part.StockQuantity >= LowStockThreshold)
                await ResolveLowStockNotificationsAsync(part.Id);
        }

        // Reload for full response
        await _context.Entry(invoice)
            .Reference(i => i.Vendor).LoadAsync();
        foreach (var item in invoice.PurchaseInvoiceItems)
            await _context.Entry(item).Reference(i => i.Part).LoadAsync();

        return _mapper.Map<PurchaseInvoiceResponseDto>(invoice);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private async Task ResolveLowStockNotificationsAsync(int partId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.Type == "LowStock"
                        && !n.IsRead
                        && n.Message.Contains($"Part #{partId})"))
            .ToListAsync();

        foreach (var notification in notifications)
            notification.IsRead = true;

        if (notifications.Any())
            await _context.SaveChangesAsync();
    }
}
