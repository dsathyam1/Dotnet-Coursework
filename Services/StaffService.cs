using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Vehicle_Management_System.Data;
using Vehicle_Management_System.DTOs.Staff;
using Vehicle_Management_System.Models;
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

    // ── Get All Staff ─────────────────────────────────────────────────────────
    public async Task<List<StaffResponseDto>> GetAllStaffAsync()
    {
        var staffList = await _context.Staff
            .Include(s => s.User)
            .OrderBy(s => s.User.FullName)
            .ToListAsync();

        return _mapper.Map<List<StaffResponseDto>>(staffList);
    }

    // ── Create Staff ──────────────────────────────────────────────────────────
    public async Task<StaffResponseDto> CreateStaffAsync(CreateStaffDto dto)
    {
        var emailNormalized = dto.Email.ToLower().Trim();

        if (await _context.Users.AnyAsync(u => u.Email == emailNormalized))
            throw new InvalidOperationException("An account with this email already exists.");

        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Staff")
            ?? throw new InvalidOperationException("Staff role is not seeded in the database.");

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

        var staff = new Models.Staff
        {
            UserId       = user.Id,
            EmployeeCode = dto.EmployeeCode?.Trim(),
            Department   = dto.Department?.Trim(),
            JoinedAt     = dto.JoinedAt
        };

        _context.Staff.Add(staff);
        await _context.SaveChangesAsync();

        staff.User = user;
        return _mapper.Map<StaffResponseDto>(staff);
    }

    // ── Update Staff ──────────────────────────────────────────────────────────
    public async Task<StaffResponseDto> UpdateStaffAsync(int id, UpdateStaffDto dto)
    {
        var staff = await _context.Staff
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new KeyNotFoundException($"Staff member with ID {id} not found.");

        // Update user-level fields
        staff.User.FullName = dto.FullName.Trim();
        staff.User.Phone    = dto.Phone?.Trim();

        // Update staff-level fields
        staff.EmployeeCode = dto.EmployeeCode?.Trim();
        staff.Department   = dto.Department?.Trim();

        await _context.SaveChangesAsync();
        return _mapper.Map<StaffResponseDto>(staff);
    }

    // ── Deactivate Staff (soft delete) ────────────────────────────────────────
    public async Task<bool> DeactivateStaffAsync(int id)
    {
        var staff = await _context.Staff
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new KeyNotFoundException($"Staff member with ID {id} not found.");

        if (!staff.User.IsActive)
            return false; // already deactivated

        staff.User.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }
}
