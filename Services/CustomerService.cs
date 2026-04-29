using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Vehicle_Management_System.Data;
using Vehicle_Management_System.DTOs.Customer;
using Vehicle_Management_System.DTOs.SalesInvoice;
using Vehicle_Management_System.DTOs.Vehicle;
using Vehicle_Management_System.Models;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Services;

public class CustomerService : ICustomerService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CustomerService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    // ── List all customers ────────────────────────────────────────────────────
    public async Task<List<CustomerListDto>> GetAllAsync()
    {
        var customers = await _context.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .OrderBy(c => c.User.FullName)
            .ToListAsync();

        return _mapper.Map<List<CustomerListDto>>(customers);
    }

    // ── Get customer detail ───────────────────────────────────────────────────
    public async Task<CustomerDetailDto> GetByIdAsync(int id)
    {
        var customer = await _context.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new KeyNotFoundException($"Customer with ID {id} not found.");

        return _mapper.Map<CustomerDetailDto>(customer);
    }

    // ── Staff creates customer manually ───────────────────────────────────────
    public async Task<CustomerDetailDto> CreateAsync(CreateCustomerDto dto)
    {
        var emailNormalized = dto.Email.ToLower().Trim();

        if (await _context.Users.AnyAsync(u => u.Email == emailNormalized))
            throw new InvalidOperationException("An account with this email already exists.");

        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Customer")
            ?? throw new InvalidOperationException("Customer role is not seeded.");

        var user = new User
        {
            FullName     = dto.FullName.Trim(),
            Email        = emailNormalized,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone        = dto.Phone?.Trim(),
            RoleId       = role.Id,
            CreatedAt    = DateTime.UtcNow,
            IsActive     = true
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var customer = new Customer { UserId = user.Id };
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        // Optional initial vehicle
        if (dto.Vehicle != null)
        {
            var vehicle = _mapper.Map<Models.Vehicle>(dto.Vehicle);
            vehicle.CustomerId = customer.Id;
            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();
        }

        // Reload full graph
        await _context.Entry(customer).Reference(c => c.User).LoadAsync();
        await _context.Entry(customer).Collection(c => c.Vehicles).LoadAsync();

        return _mapper.Map<CustomerDetailDto>(customer);
    }

    // ── Update customer ───────────────────────────────────────────────────────
    public async Task<CustomerDetailDto> UpdateAsync(int id, UpdateCustomerDto dto)
    {
        var customer = await _context.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new KeyNotFoundException($"Customer with ID {id} not found.");

        customer.User.FullName = dto.FullName.Trim();
        customer.User.Phone    = dto.Phone?.Trim();

        await _context.SaveChangesAsync();
        return _mapper.Map<CustomerDetailDto>(customer);
    }

    // ── Get customer vehicles ─────────────────────────────────────────────────
    public async Task<List<VehicleResponseDto>> GetVehiclesAsync(int customerId)
    {
        var exists = await _context.Customers.AnyAsync(c => c.Id == customerId);
        if (!exists)
            throw new KeyNotFoundException($"Customer with ID {customerId} not found.");

        var vehicles = await _context.Vehicles
            .Where(v => v.CustomerId == customerId)
            .ToListAsync();

        return _mapper.Map<List<VehicleResponseDto>>(vehicles);
    }

    // ── Add vehicle to customer ───────────────────────────────────────────────
    public async Task<VehicleResponseDto> AddVehicleAsync(int customerId, VehicleDto dto)
    {
        var exists = await _context.Customers.AnyAsync(c => c.Id == customerId);
        if (!exists)
            throw new KeyNotFoundException($"Customer with ID {customerId} not found.");

        var vehicle = _mapper.Map<Models.Vehicle>(dto);
        vehicle.CustomerId = customerId;

        // Ensure LastServiceDate is UTC for PostgreSQL if provided
        if (vehicle.LastServiceDate.HasValue)
            vehicle.LastServiceDate = DateTime.SpecifyKind(vehicle.LastServiceDate.Value, DateTimeKind.Utc);

        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        return _mapper.Map<VehicleResponseDto>(vehicle);
    }

    // ── Get customer invoices ─────────────────────────────────────────────────
    public async Task<List<SalesInvoiceResponseDto>> GetInvoicesAsync(int customerId)
    {
        var exists = await _context.Customers.AnyAsync(c => c.Id == customerId);
        if (!exists)
            throw new KeyNotFoundException($"Customer with ID {customerId} not found.");

        var invoices = await _context.SalesInvoices
            .Include(i => i.Customer).ThenInclude(c => c.User)
            .Include(i => i.Staff).ThenInclude(s => s.User)
            .Include(i => i.SalesInvoiceItems).ThenInclude(item => item.Part)
            .Where(i => i.CustomerId == customerId)
            .OrderByDescending(i => i.SaleDate)
            .ToListAsync();

        return _mapper.Map<List<SalesInvoiceResponseDto>>(invoices);
    }

    // ── Search customers ──────────────────────────────────────────────────────
    public async Task<List<CustomerSearchResultDto>> SearchAsync(string term)
    {
        var t = term.Trim();
        var tLower = t.ToLower();
        // Normalize search term: remove spaces and hyphens
        var tNormalized = t.Replace(" ", "").Replace("-", "").ToLower();
        var isNumeric = int.TryParse(t, out var parsedId);

        var query = _context.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .AsQueryable();

        // Robust search handling common formats like "BA 1 CHA 1234", "BA-1-CHA-1234", or "BA1CHA1234"
        query = query.Where(c =>
            c.User.FullName.ToLower().Contains(tLower) ||
            (c.User.Phone != null && c.User.Phone.Contains(t)) ||
            c.Vehicles.Any(v => v.NumberPlate != null && (
                v.NumberPlate.ToLower().Contains(tLower) ||
                v.NumberPlate.Replace(" ", "").Replace("-", "").ToLower().Contains(tNormalized)
            )) ||
            (isNumeric && c.Id == parsedId));

        var customers = await query
            .OrderBy(c => c.User.FullName)
            .ToListAsync();

        return _mapper.Map<List<CustomerSearchResultDto>>(customers);
    }

    private static string NormalizePlate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        return new string(value
            .Where(char.IsLetterOrDigit)
            .Select(char.ToLowerInvariant)
            .ToArray());
    }

    // ── Resolve customer from JWT user ────────────────────────────────────────
    public async Task<int> GetCustomerIdByUserIdAsync(int userId)
    {
        var customerId = await _context.Customers
            .Where(c => c.UserId == userId)
            .Select(c => c.Id)
            .FirstOrDefaultAsync();

        if (customerId == 0)
            throw new KeyNotFoundException("No customer record found for the current user.");

        return customerId;
    }
}
