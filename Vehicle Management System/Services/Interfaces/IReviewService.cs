using Vehicle_Management_System.DTOs.Review;

namespace Vehicle_Management_System.Services.Interfaces;

public interface IReviewService
{
    Task<List<ReviewResponseDto>> GetAllAsync();
    Task<List<ReviewResponseDto>> GetByUserIdAsync(int userId);
    Task<ReviewResponseDto> CreateAsync(int customerId, CreateReviewDto dto);
    Task<ReviewResponseDto> CreateByUserIdAsync(int userId, CreateReviewDto dto);
    Task DeleteAsync(int id);
}
