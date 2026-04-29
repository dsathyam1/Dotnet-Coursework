using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Vehicle_Management_System.Data;
using Vehicle_Management_System.DTOs.Review;
using Vehicle_Management_System.Models;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Services;

public class ReviewService : IReviewService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ReviewService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ReviewResponseDto>> GetAllAsync()
    {
        var reviews = await _context.Reviews
            .Include(r => r.Customer).ThenInclude(c => c.User)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ReviewResponseDto>>(reviews);
    }

    public async Task<ReviewResponseDto> SubmitAsync(int customerId, CreateReviewDto dto)
    {
        var customerExists = await _context.Customers.AnyAsync(c => c.Id == customerId);
        if (!customerExists)
            throw new KeyNotFoundException("Customer record not found.");

        var review = new Review
        {
            CustomerId = customerId,
            Rating     = dto.Rating,
            Comment    = dto.Comment?.Trim(),
            CreatedAt  = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        await _context.Entry(review)
            .Reference(r => r.Customer)
            .Query()
            .Include(c => c.User)
            .LoadAsync();

        return _mapper.Map<ReviewResponseDto>(review);
    }
}
