using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Vehicle_Management_System.Data;
using Vehicle_Management_System.DTOs.Auth;
using Vehicle_Management_System.Helpers;
using Vehicle_Management_System.Models;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly JwtHelper _jwtHelper;
    private readonly IMapper _mapper;
    private readonly ILogger<AuthService> _logger;

    public AuthService(ApplicationDbContext context, JwtHelper jwtHelper, IMapper mapper, ILogger<AuthService> logger)
    {
        _context = context;
        _jwtHelper = jwtHelper;
        _mapper = mapper;
        _logger = logger;
    }

    // ── Login ─────────────────────────────────────────────────────────────────
    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower().Trim());

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Your account has been deactivated.");

        return BuildAuthResponse(user);
    }

    // ── Register Customer ─────────────────────────────────────────────────────
    public async Task<AuthResponseDto> RegisterCustomerAsync(RegisterCustomerDto dto)
    {
        _logger.LogInformation("Starting registration for email: {Email}", dto.Email);
        var emailNormalized = dto.Email.ToLower().Trim();

        if (await _context.Users.AnyAsync(u => u.Email == emailNormalized))
        {
            _logger.LogWarning("Registration failed: Email {Email} already exists.", dto.Email);
            throw new InvalidOperationException("An account with this email already exists.");
        }

        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Customer")
            ?? throw new InvalidOperationException("Customer role is not seeded in the database.");

        _logger.LogInformation("Hashing password for {Email}...", dto.Email);
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password, 10);
        _logger.LogInformation("Password hashed for {Email}.", dto.Email);

        var user = new User
        {
            FullName     = dto.FullName.Trim(),
            Email        = emailNormalized,
            PasswordHash = hashedPassword,
            Phone        = dto.Phone?.Trim(),
            RoleId       = role.Id,
            CreatedAt    = DateTime.UtcNow,
            IsActive     = true
        };

        _context.Users.Add(user);
        _logger.LogInformation("Saving User record for {Email}...", dto.Email);
        await _context.SaveChangesAsync();
        _logger.LogInformation("User record saved (ID: {UserId}) for {Email}.", user.Id, dto.Email);

        var customer = new Customer { UserId = user.Id };
        _context.Customers.Add(customer);
        _logger.LogInformation("Saving Customer record for {Email}...", dto.Email);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Customer record saved for {Email}.", dto.Email);

        user.Role = role;
        _logger.LogInformation("Registration completed for {Email}.", dto.Email);
        return BuildAuthResponse(user);
    }

    // ── Get Profile ───────────────────────────────────────────────────────────
    public async Task<UserProfileDto> GetProfileAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("User not found.");

        return _mapper.Map<UserProfileDto>(user);
    }

    // ── Update Profile ────────────────────────────────────────────────────────
    public async Task<UserProfileDto> UpdateProfileAsync(int userId, UpdateProfileDto dto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("User not found.");

        user.FullName = dto.FullName.Trim();
        user.Phone    = dto.Phone?.Trim();

        await _context.SaveChangesAsync();
        return _mapper.Map<UserProfileDto>(user);
    }

    // ── Private helpers ───────────────────────────────────────────────────────
    private AuthResponseDto BuildAuthResponse(User user) => new()
    {
        Token    = _jwtHelper.GenerateToken(user),
        UserId   = user.Id,
        FullName = user.FullName,
        Email    = user.Email,
        Role     = user.Role?.Name ?? string.Empty
    };
}
