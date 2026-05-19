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

    public SalesInvoiceService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    private IQueryable<SalesInvoice> BaseQuery() =>
        _context.SalesInvoices
            .Include(i => i.Customer).ThenInclude(c => c.User)
            .Include(i => i.Staff).ThenInclude(s => s.User)
            .Include(i => i.SalesInvoiceItems).ThenInclude(item => item.Part);

    public async Task<List<SalesInvoiceResponseDto>> GetAllAsync()
    {
        var invoices = await BaseQuery()
            .OrderByDescending(i => i.SaleDate)
            .ToListAsync();
        return _mapper.Map<List<SalesInvoiceResponseDto>>(invoices);
    }

    public async Task<List<SalesInvoiceResponseDto>> GetByCustomerAsync(int customerId)
    {
        var invoices = await BaseQuery()
            .Where(i => i.CustomerId == customerId)
            .OrderByDescending(i => i.SaleDate)
            .ToListAsync();
        return _mapper.Map<List<SalesInvoiceResponseDto>>(invoices);
    }

    public async Task<SalesInvoiceResponseDto> GetByIdAsync(int id)
    {
        var invoice = await BaseQuery().FirstOrDefaultAsync(i => i.Id == id)
            ?? throw new KeyNotFoundException($"Sales invoice with ID {id} not found.");
        return _mapper.Map<SalesInvoiceResponseDto>(invoice);
    }

    public async Task<SalesInvoiceResponseDto> CreateAsync(CreateSalesInvoiceDto dto, int staffUserId)
    {
        // Resolve staffId from the user ID in the JWT claim
        var staff = await _context.Staff.FirstOrDefaultAsync(s => s.UserId == staffUserId)
            ?? throw new KeyNotFoundException("Staff record not found for the current user.");

        var customer = await _context.Customers.FindAsync(dto.CustomerId)
            ?? throw new KeyNotFoundException($"Customer with ID {dto.CustomerId} not found.");

        var partIds = dto.Items.Select(i => i.PartId).Distinct().ToList();
        var parts   = await _context.Parts.Where(p => partIds.Contains(p.Id)).ToListAsync();

        var missingId = partIds.FirstOrDefault(id => parts.All(p => p.Id != id));
        if (missingId != 0)
            throw new KeyNotFoundException($"Part with ID {missingId} not found.");

        // Check sufficient stock
        foreach (var item in dto.Items)
        {
            var part = parts.First(p => p.Id == item.PartId);
            if (part.StockQuantity < item.Quantity)
                throw new InvalidOperationException(
                    $"Insufficient stock for part '{part.Name}'. Available: {part.StockQuantity}, Requested: {item.Quantity}.");
        }

        decimal subtotal = 0;
        var invoiceItems = new List<SalesInvoiceItem>();

        foreach (var itemDto in dto.Items)
        {
            var part = parts.First(p => p.Id == itemDto.PartId);
            part.StockQuantity -= itemDto.Quantity;
            subtotal += itemDto.Quantity * part.SellingPrice;

            invoiceItems.Add(new SalesInvoiceItem
            {
                PartId          = itemDto.PartId,
                Quantity        = itemDto.Quantity,
                UnitSellingPrice = part.SellingPrice
            });
        }

        // Apply 10% loyalty discount
        decimal totalAmount = dto.DiscountApplied ? subtotal * 0.9m : subtotal;

        var invoice = new SalesInvoice
        {
            CustomerId       = dto.CustomerId,
            StaffId          = staff.Id,
            TotalAmount      = totalAmount,
            DiscountApplied  = dto.DiscountApplied,
            IsCreditSale     = dto.IsCreditSale,
            IsPaid           = !dto.IsCreditSale,
            SaleDate         = DateTime.UtcNow,
            SalesInvoiceItems = invoiceItems
        };

        _context.SalesInvoices.Add(invoice);

        // Update customer financials
        customer.TotalSpent += totalAmount;
        if (dto.IsCreditSale)
            customer.CreditBalance += totalAmount;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(invoice.Id);
    }

    public async Task<SalesInvoiceResponseDto> MarkAsPaidAsync(int id)
    {
        var invoice = await _context.SalesInvoices
            .Include(i => i.Customer)
            .FirstOrDefaultAsync(i => i.Id == id)
            ?? throw new KeyNotFoundException($"Sales invoice with ID {id} not found.");

        if (invoice.IsPaid)
            throw new InvalidOperationException("Invoice is already marked as paid.");

        invoice.IsPaid = true;

        if (invoice.IsCreditSale)
        {
            invoice.Customer.CreditBalance -= invoice.TotalAmount;
            if (invoice.Customer.CreditBalance < 0) invoice.Customer.CreditBalance = 0;
            invoice.Customer.LastCreditPaidAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return await GetByIdAsync(id);
    }
}
