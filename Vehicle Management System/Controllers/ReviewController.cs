using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vehicle_Management_System.DTOs.Review;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewController : ControllerBase
{
    private readonly IReviewService _reviewService;
    private readonly ICustomerService _customerService;

    public ReviewController(IReviewService reviewService, ICustomerService customerService)
    {
        _reviewService   = reviewService;
        _customerService = customerService;
    }

    // GET /api/reviews  — public
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<ReviewResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var reviews = await _reviewService.GetAllAsync();
        return Ok(reviews);
    }

    // POST /api/reviews  — Customer only
    [HttpPost]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(typeof(ReviewResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Submit([FromBody] CreateReviewDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userIdClaim = User.FindFirstValue("userId");
        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Invalid token." });

        try
        {
            var customerId = await _customerService.GetCustomerIdByUserIdAsync(userId);
            var review     = await _reviewService.SubmitAsync(customerId, dto);
            return StatusCode(StatusCodes.Status201Created, review);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
