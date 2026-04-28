using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Vehicle_Management_System.Data;
using Vehicle_Management_System.DTOs.Part;
using Vehicle_Management_System.Models;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Services;

public class PartService : IPartService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    private const int LowStockThreshold = 10;

    public PartService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<PartResponseDto>> GetAllAsync()
    {
        var parts = await _context.Parts
            .Include(p => p.Vendor)
            .OrderBy(p => p.Name)
            .ToListAsync();

        return _mapper.Map<List<PartResponseDto>>(parts);
    }

    public async Task<PartResponseDto> GetByIdAsync(int id)
    {
        var part = await _context.Parts
            .Include(p => p.Vendor)
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new KeyNotFoundException($"Part with ID {id} not found.");

        return _mapper.Map<PartResponseDto>(part);
    }

    public async Task<PartResponseDto> CreateAsync(PartDto dto)
    {
        // Validate vendor exists
        var vendorExists = await _context.Vendors.AnyAsync(v => v.Id == dto.VendorId);
        if (!vendorExists)
            throw new KeyNotFoundException($"Vendor with ID {dto.VendorId} not found.");

        var part = _mapper.Map<Part>(dto);
        part.CreatedAt = DateTime.UtcNow;

        _context.Parts.Add(part);
        await _context.SaveChangesAsync();

        // Check and notify if low stock on creation
        if (part.StockQuantity < LowStockThreshold)
            await NotifyAdminsLowStockAsync(part);

        // Reload with vendor for response
        await _context.Entry(part).Reference(p => p.Vendor).LoadAsync();
        return _mapper.Map<PartResponseDto>(part);
    }

    public async Task<PartResponseDto> UpdateAsync(int id, PartDto dto)
    {
        var part = await _context.Parts
            .Include(p => p.Vendor)
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new KeyNotFoundException($"Part with ID {id} not found.");

        // Validate new vendor exists if changed
        if (dto.VendorId != part.VendorId)
        {
            var vendorExists = await _context.Vendors.AnyAsync(v => v.Id == dto.VendorId);
            if (!vendorExists)
                throw new KeyNotFoundException($"Vendor with ID {dto.VendorId} not found.");
        }

        _mapper.Map(dto, part);
        await _context.SaveChangesAsync();

        // Check and notify if low stock after update
        if (part.StockQuantity < LowStockThreshold)
            await NotifyAdminsLowStockAsync(part);

        // Reload vendor if changed
        if (part.Vendor?.Id != dto.VendorId)
            await _context.Entry(part).Reference(p => p.Vendor).LoadAsync();

        return _mapper.Map<PartResponseDto>(part);
    }

    public async Task DeleteAsync(int id)
    {
        var part = await _context.Parts.FindAsync(id)
            ?? throw new KeyNotFoundException($"Part with ID {id} not found.");

        var isReferenced =
            await _context.SalesInvoiceItems.AnyAsync(s => s.PartId == id) ||
            await _context.PurchaseInvoiceItems.AnyAsync(p => p.PartId == id);

        if (isReferenced)
            throw new InvalidOperationException(
                "Cannot delete this part because it is referenced in existing invoices.");

        _context.Parts.Remove(part);
        await _context.SaveChangesAsync();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private async Task NotifyAdminsLowStockAsync(Part part)
    {
        var adminRoleId = await _context.Roles
            .Where(r => r.Name == "Admin")
            .Select(r => r.Id)
            .FirstOrDefaultAsync();

        if (adminRoleId == 0) return;

        var adminUserIds = await _context.Users
            .Where(u => u.RoleId == adminRoleId && u.IsActive)
            .Select(u => u.Id)
            .ToListAsync();

        // Avoid duplicate notifications: skip if an unread one already exists for this part
        var existingPartIds = await _context.Notifications
            .Where(n => n.Type == "LowStock" && !n.IsRead
                        && n.Message.Contains($"Part #{part.Id})"))
            .Select(n => n.UserId)
            .ToListAsync();

        var notifications = adminUserIds
            .Where(uid => !existingPartIds.Contains(uid))
            .Select(uid => new Notification
            {
                UserId    = uid,
                Message   = $"Low stock alert: Part '{part.Name}' (Part #{part.Id}) has only {part.StockQuantity} unit(s) remaining.",
                Type      = "LowStock",
                IsRead    = false,
                CreatedAt = DateTime.UtcNow
            })
            .ToList();

        if (notifications.Any())
        {
            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();
        }
    }
}
