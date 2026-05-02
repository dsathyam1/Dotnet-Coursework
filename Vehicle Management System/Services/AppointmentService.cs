using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Vehicle_Management_System.Data;
using Vehicle_Management_System.DTOs.Appointment;
using Vehicle_Management_System.Models;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Services;

public class AppointmentService : IAppointmentService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public AppointmentService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    private IQueryable<Appointment> BaseQuery() =>
        _context.Appointments
            .Include(a => a.Customer).ThenInclude(c => c.User)
            .Include(a => a.Vehicle);

    public async Task<List<AppointmentResponseDto>> GetAllAsync()
    {
        var list = await BaseQuery().OrderByDescending(a => a.AppointmentDate).ToListAsync();
        return _mapper.Map<List<AppointmentResponseDto>>(list);
    }

    public async Task<List<AppointmentResponseDto>> GetByCustomerAsync(int customerId)
    {
        var list = await BaseQuery()
            .Where(a => a.CustomerId == customerId)
            .OrderByDescending(a => a.AppointmentDate)
            .ToListAsync();
        return _mapper.Map<List<AppointmentResponseDto>>(list);
    }

    public async Task<List<AppointmentResponseDto>> GetByCustomerUserIdAsync(int userId)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return new List<AppointmentResponseDto>();
        return await GetByCustomerAsync(customer.Id);
    }

    public async Task<AppointmentResponseDto> GetByIdAsync(int id)
    {
        var appt = await BaseQuery().FirstOrDefaultAsync(a => a.Id == id)
            ?? throw new KeyNotFoundException($"Appointment with ID {id} not found.");
        return _mapper.Map<AppointmentResponseDto>(appt);
    }

    public async Task<AppointmentResponseDto> CreateAsync(CreateAppointmentDto dto)
    {
        _ = await _context.Customers.FindAsync(dto.CustomerId)
            ?? throw new KeyNotFoundException($"Customer with ID {dto.CustomerId} not found.");

        _ = await _context.Vehicles
            .FirstOrDefaultAsync(v => v.Id == dto.VehicleId && v.CustomerId == dto.CustomerId)
            ?? throw new KeyNotFoundException($"Vehicle with ID {dto.VehicleId} not found for this customer.");

        var appt = new Appointment
        {
            CustomerId      = dto.CustomerId,
            VehicleId       = dto.VehicleId,
            AppointmentDate = dto.AppointmentDate.ToUniversalTime(),
            ServiceType     = dto.ServiceType,
            Notes           = dto.Notes,
            Status          = "Pending"
        };

        _context.Appointments.Add(appt);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(appt.Id);
    }

    public async Task<AppointmentResponseDto> CreateByUserIdAsync(int userId, CustomerCreateAppointmentDto dto)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId)
            ?? throw new KeyNotFoundException($"Customer for user ID {userId} not found.");

        _ = await _context.Vehicles
            .FirstOrDefaultAsync(v => v.Id == dto.VehicleId && v.CustomerId == customer.Id)
            ?? throw new KeyNotFoundException($"Vehicle with ID {dto.VehicleId} not found for this customer.");

        var appt = new Appointment
        {
            CustomerId      = customer.Id,
            VehicleId       = dto.VehicleId,
            AppointmentDate = dto.AppointmentDate.ToUniversalTime(),
            ServiceType     = dto.ServiceType,
            Notes           = dto.Notes,
            Status          = "Pending"
        };

        _context.Appointments.Add(appt);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(appt.Id);
    }

    public async Task<AppointmentResponseDto> UpdateStatusAsync(int id, string status)
    {
        var appt = await _context.Appointments.FindAsync(id)
            ?? throw new KeyNotFoundException($"Appointment with ID {id} not found.");
        appt.Status = status;
        await _context.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(int id)
    {
        var appt = await _context.Appointments.FindAsync(id)
            ?? throw new KeyNotFoundException($"Appointment with ID {id} not found.");
        _context.Appointments.Remove(appt);
        await _context.SaveChangesAsync();
    }
}
