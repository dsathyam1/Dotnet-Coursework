using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Vehicle_Management_System.Data;
using Vehicle_Management_System.DTOs.PartRequest;
using Vehicle_Management_System.Models;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Services;

public class PartRequestService : IPartRequestService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public PartRequestService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<PartRequestResponseDto>> GetAllAsync()
    {
        var list = await _context.PartRequests
            .OrderByDescending(r => r.RequestedAt)
            .ToListAsync();
        return _mapper.Map<List<PartRequestResponseDto>>(list);
    }

    public async Task<List<PartRequestResponseDto>> GetByCustomerAsync(int customerId)
    {
        var list = await _context.PartRequests
            .Where(r => r.CustomerId == customerId)
            .OrderByDescending(r => r.RequestedAt)
            .ToListAsync();
        return _mapper.Map<List<PartRequestResponseDto>>(list);
    }

    public async Task<List<PartRequestResponseDto>> GetByCustomerUserIdAsync(int userId)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return new List<PartRequestResponseDto>();
        return await GetByCustomerAsync(customer.Id);
    }

    public async Task<PartRequestResponseDto> CreateByUserIdAsync(int userId, CreatePartRequestDto dto)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId)
            ?? throw new KeyNotFoundException($"Customer for user ID {userId} not found.");
        return await CreateAsync(customer.Id, dto);
    }

    public async Task<PartRequestResponseDto> CreateAsync(int customerId, CreatePartRequestDto dto)
    {
        _ = await _context.Customers.FindAsync(customerId)
            ?? throw new KeyNotFoundException($"Customer with ID {customerId} not found.");

        var req = new PartRequest
        {
            CustomerId  = customerId,
            PartName    = dto.PartName,
            Description = dto.Description,
            RequestedAt = DateTime.UtcNow,
            Status      = "Pending"
        };

        _context.PartRequests.Add(req);
        await _context.SaveChangesAsync();
        return _mapper.Map<PartRequestResponseDto>(req);
    }

    public async Task<PartRequestResponseDto> UpdateStatusAsync(int id, string status)
    {
        var req = await _context.PartRequests.FindAsync(id)
            ?? throw new KeyNotFoundException($"Part request with ID {id} not found.");
        req.Status = status;
        await _context.SaveChangesAsync();
        return _mapper.Map<PartRequestResponseDto>(req);
    }
}
