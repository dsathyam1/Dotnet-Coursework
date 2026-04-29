using Vehicle_Management_System.DTOs.Review;

namespace Vehicle_Management_System.Services.Interfaces;

public interface IReviewService
{
    Task<List<ReviewResponseDto>> GetAllAsync();
    Task<ReviewResponseDto> SubmitAsync(int customerId, CreateReviewDto dto);
}
