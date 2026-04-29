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

    public async Task<List<PartRequestResponseDto>> GetMyRequestsAsync(int customerId)
    {
        var requests = await _context.PartRequests
            .Where(pr => pr.CustomerId == customerId)
            .OrderByDescending(pr => pr.RequestedAt)
            .ToListAsync();

        return _mapper.Map<List<PartRequestResponseDto>>(requests);
    }

    public async Task<PartRequestResponseDto> SubmitAsync(int customerId, CreatePartRequestDto dto)
    {
        var partRequest = new PartRequest
        {
            CustomerId  = customerId,
            PartName    = dto.PartName.Trim(),
            Description = dto.Description?.Trim(),
            RequestedAt = DateTime.UtcNow,
            Status      = "Pending"
        };

        _context.PartRequests.Add(partRequest);
        await _context.SaveChangesAsync();

        return _mapper.Map<PartRequestResponseDto>(partRequest);
    }
}
