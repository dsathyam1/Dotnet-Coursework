using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Vehicle_Management_System.Data;
using Vehicle_Management_System.DTOs.Customer;
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

    public async Task<List<CustomerListDto>> GetAllAsync()
    {
        var customers = await _context.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .ToListAsync();
        return _mapper.Map<List<CustomerListDto>>(customers);
    }

    public async Task<CustomerDetailDto> GetByIdAsync(int id)
    {
        var customer = await _context.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new KeyNotFoundException($"Customer with ID {id} not found.");
        return _mapper.Map<CustomerDetailDto>(customer);
    }

    public async Task<CustomerDetailDto> GetByUserIdAsync(int userId)
    {
        var customer = await _context.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.UserId == userId)
            ?? throw new KeyNotFoundException($"Customer for user ID {userId} not found.");
        return _mapper.Map<CustomerDetailDto>(customer);
    }

    public async Task<List<CustomerSearchResultDto>> SearchAsync(string query)
    {
        var q = query.ToLower();
        var customers = await _context.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .Where(c => c.User.FullName.ToLower().Contains(q)
                     || c.User.Email.ToLower().Contains(q)
                     || (c.User.Phone != null && c.User.Phone.Contains(q))
                     || c.Id.ToString().Contains(q)
                     || c.Vehicles.Any(v => v.NumberPlate != null && v.NumberPlate.ToLower().Contains(q)))
            .Take(20)
            .ToListAsync();
        return _mapper.Map<List<CustomerSearchResultDto>>(customers);
    }

    public async Task<CustomerDetailDto> CreateAsync(CreateCustomerDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            throw new InvalidOperationException("Email already registered.");

        var customerRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Customer")
            ?? throw new InvalidOperationException("Customer role not seeded.");

        var user = new User
        {
            FullName     = dto.FullName,
            Email        = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone        = dto.Phone,
            RoleId       = customerRole.Id,
            CreatedAt    = DateTime.UtcNow
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var customer = new Customer { UserId = user.Id };

        // Map any initial vehicles (licensePlate → NumberPlate via JsonPropertyName)
        foreach (var vDto in dto.Vehicles)
        {
            customer.Vehicles.Add(new Vehicle
            {
                Make            = vDto.Make,
                Model           = vDto.Model,
                Year            = vDto.Year,
                NumberPlate     = vDto.NumberPlate,   // frontend sends "licensePlate"
                Mileage         = vDto.Mileage,
                LastServiceDate = vDto.LastServiceDate
            });
        }

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(customer.Id);
    }

    public async Task<CustomerDetailDto> UpdateAsync(int id, UpdateCustomerDto dto)
    {
        var customer = await _context.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new KeyNotFoundException($"Customer with ID {id} not found.");

        if (dto.FullName != null) customer.User.FullName = dto.FullName;
        if (dto.Phone    != null) customer.User.Phone    = dto.Phone;
        if (dto.IsActive.HasValue) customer.User.IsActive = dto.IsActive.Value;

        await _context.SaveChangesAsync();
        return _mapper.Map<CustomerDetailDto>(customer);
    }

    public async Task<VehicleResponseDto> AddVehicleAsync(int customerId, VehicleDto dto)
    {
        var customer = await _context.Customers.FindAsync(customerId)
            ?? throw new KeyNotFoundException($"Customer with ID {customerId} not found.");

        var vehicle = new Vehicle
        {
            CustomerId      = customerId,
            Make            = dto.Make,
            Model           = dto.Model,
            Year            = dto.Year,
            NumberPlate     = dto.NumberPlate,   // frontend sends "licensePlate"
            Mileage         = dto.Mileage,
            LastServiceDate = dto.LastServiceDate
        };

        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();
        return _mapper.Map<VehicleResponseDto>(vehicle);
    }

    public async Task DeleteVehicleAsync(int customerId, int vehicleId)
    {
        var vehicle = await _context.Vehicles
            .FirstOrDefaultAsync(v => v.Id == vehicleId && v.CustomerId == customerId)
            ?? throw new KeyNotFoundException($"Vehicle with ID {vehicleId} not found for customer {customerId}.");

        _context.Vehicles.Remove(vehicle);
        await _context.SaveChangesAsync();
    }

    public async Task<VehicleResponseDto> AddVehicleByUserIdAsync(int userId, VehicleDto dto)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.UserId == userId)
            ?? throw new KeyNotFoundException($"Customer for user ID {userId} not found.");
        return await AddVehicleAsync(customer.Id, dto);
    }

    public async Task DeleteVehicleByUserIdAsync(int userId, int vehicleId)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.UserId == userId)
            ?? throw new KeyNotFoundException($"Customer for user ID {userId} not found.");
        await DeleteVehicleAsync(customer.Id, vehicleId);
    }

    public async Task<VehicleResponseDto> UpdateVehicleAsync(int customerId, int vehicleId, VehicleDto dto)
    {
        var vehicle = await _context.Vehicles
            .FirstOrDefaultAsync(v => v.Id == vehicleId && v.CustomerId == customerId)
            ?? throw new KeyNotFoundException($"Vehicle with ID {vehicleId} not found for customer {customerId}.");

        vehicle.Make            = dto.Make            ?? vehicle.Make;
        vehicle.Model           = dto.Model           ?? vehicle.Model;
        vehicle.Year            = dto.Year != 0       ? dto.Year : vehicle.Year;
        vehicle.NumberPlate     = dto.NumberPlate     ?? vehicle.NumberPlate;  // frontend: "licensePlate"
        vehicle.Mileage         = dto.Mileage != 0    ? dto.Mileage : vehicle.Mileage;
        vehicle.LastServiceDate = dto.LastServiceDate ?? vehicle.LastServiceDate;

        await _context.SaveChangesAsync();
        return _mapper.Map<VehicleResponseDto>(vehicle);
    }
}
