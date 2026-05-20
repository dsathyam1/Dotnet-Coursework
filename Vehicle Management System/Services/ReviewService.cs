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

    public async Task<List<ReviewResponseDto>> GetByUserIdAsync(int userId)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return new List<ReviewResponseDto>();

        var reviews = await _context.Reviews
            .Include(r => r.Customer).ThenInclude(c => c.User)
            .Where(r => r.CustomerId == customer.Id)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
        return _mapper.Map<List<ReviewResponseDto>>(reviews);
    }

    public async Task<ReviewResponseDto> CreateAsync(int customerId, CreateReviewDto dto)
    {
        _ = await _context.Customers.FindAsync(customerId)
            ?? throw new KeyNotFoundException($"Customer with ID {customerId} not found.");

        var review = new Review
        {
            CustomerId = customerId,
            Rating     = dto.Rating,
            Comment    = dto.Comment,
            CreatedAt  = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        await _context.Entry(review).Reference(r => r.Customer).LoadAsync();
        await _context.Entry(review.Customer).Reference(c => c.User).LoadAsync();

        return _mapper.Map<ReviewResponseDto>(review);
    }

    public async Task<ReviewResponseDto> CreateByUserIdAsync(int userId, CreateReviewDto dto)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId)
            ?? throw new KeyNotFoundException($"Customer for user ID {userId} not found.");
        return await CreateAsync(customer.Id, dto);
    }

    public async Task DeleteAsync(int id)
    {
        var review = await _context.Reviews.FindAsync(id)
            ?? throw new KeyNotFoundException($"Review with ID {id} not found.");
        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();
    }
}
