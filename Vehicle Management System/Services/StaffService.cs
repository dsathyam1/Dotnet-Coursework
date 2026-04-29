using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Vehicle_Management_System.Data;
using Vehicle_Management_System.DTOs.Staff;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Services;

public class StaffService : IStaffService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public StaffService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<StaffResponseDto>> GetAllAsync()
    {
        var staff = await _context.Staff
            .Include(s => s.User)
            .OrderByDescending(s => s.User.IsActive)  // active first
            .ThenBy(s => s.User.FullName)
            .ToListAsync();
        return _mapper.Map<List<StaffResponseDto>>(staff);
    }

    public async Task<StaffResponseDto> GetByIdAsync(int id)
    {
        var staff = await _context.Staff
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new KeyNotFoundException($"Staff with ID {id} not found.");
        return _mapper.Map<StaffResponseDto>(staff);
    }

    public async Task<StaffResponseDto> CreateAsync(CreateStaffDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            throw new InvalidOperationException($"User with email {dto.Email} already exists.");

        // Staff RoleId is 2
        var user = new Vehicle_Management_System.Models.User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone = dto.Phone,
            RoleId = 2,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        var staff = new Vehicle_Management_System.Models.Staff
        {
            User = user,
            Department = dto.Department,
            EmployeeCode = dto.EmployeeCode
        };

        _context.Staff.Add(staff);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(staff.Id);
    }

    public async Task<StaffResponseDto> UpdateAsync(int id, UpdateStaffDto dto)
    {
        var staff = await _context.Staff
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new KeyNotFoundException($"Staff with ID {id} not found.");

        staff.User.FullName = dto.FullName;
        staff.User.Phone = dto.Phone;
        staff.Department = dto.Department;
        staff.EmployeeCode = dto.EmployeeCode;

        await _context.SaveChangesAsync();
        return _mapper.Map<StaffResponseDto>(staff);
    }

    public async Task<StaffResponseDto> SetActiveAsync(int id, bool isActive)
    {
        var staff = await _context.Staff
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new KeyNotFoundException($"Staff with ID {id} not found.");

        staff.User.IsActive = isActive;
        await _context.SaveChangesAsync();
        return _mapper.Map<StaffResponseDto>(staff);
    }
}
