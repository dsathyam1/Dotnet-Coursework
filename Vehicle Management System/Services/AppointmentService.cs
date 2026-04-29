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

    public async Task<List<AppointmentResponseDto>> GetMyAppointmentsAsync(int customerId)
    {
        var appointments = await _context.Appointments
            .Include(a => a.Vehicle)
            .Where(a => a.CustomerId == customerId)
            .OrderByDescending(a => a.AppointmentDate)
            .ToListAsync();

        return _mapper.Map<List<AppointmentResponseDto>>(appointments);
    }

    public async Task<AppointmentResponseDto> BookAsync(int customerId, CreateAppointmentDto dto)
    {
        // Validate appointment date is in the future
        if (dto.AppointmentDate <= DateTime.UtcNow)
            throw new InvalidOperationException("Appointment date must be in the future.");

        // Validate the vehicle belongs to this customer
        var vehicle = await _context.Vehicles
            .FirstOrDefaultAsync(v => v.Id == dto.VehicleId && v.CustomerId == customerId)
            ?? throw new InvalidOperationException(
                $"Vehicle with ID {dto.VehicleId} does not belong to your account.");

        var appointment = new Appointment
        {
            CustomerId      = customerId,
            VehicleId       = dto.VehicleId,
            // Ensure the date is treated as UTC for PostgreSQL
            AppointmentDate = DateTime.SpecifyKind(dto.AppointmentDate, DateTimeKind.Utc),
            ServiceType     = dto.ServiceType?.Trim(),
            Notes           = dto.Notes?.Trim(),
            Status          = "Pending"
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        appointment.Vehicle = vehicle;
        return _mapper.Map<AppointmentResponseDto>(appointment);
    }

    public async Task CancelAsync(int appointmentId, int customerId)
    {
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == appointmentId && a.CustomerId == customerId)
            ?? throw new KeyNotFoundException($"Appointment with ID {appointmentId} not found.");

        if (appointment.Status != "Pending")
            throw new InvalidOperationException(
                $"Only pending appointments can be cancelled. Current status: '{appointment.Status}'.");

        appointment.Status = "Cancelled";
        await _context.SaveChangesAsync();
    }
}
