using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vehicle_Management_System.DTOs.PartRequest;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Controllers;

[ApiController]
[Route("api/part-requests")]
[Authorize(Roles = "Customer")]
public class PartRequestController : ControllerBase
{
    private readonly IPartRequestService _partRequestService;
    private readonly ICustomerService _customerService;

    public PartRequestController(IPartRequestService partRequestService, ICustomerService customerService)
    {
        _partRequestService = partRequestService;
        _customerService    = customerService;
    }

    // GET /api/part-requests/my
    [HttpGet("my")]
    [ProducesResponseType(typeof(List<PartRequestResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMy()
    {
        var customerId = await ResolveCustomerIdAsync();
        if (customerId == null) return Unauthorized(new { message = "Customer record not found." });

        var requests = await _partRequestService.GetMyRequestsAsync(customerId.Value);
        return Ok(requests);
    }

    // POST /api/part-requests
    [HttpPost]
    [ProducesResponseType(typeof(PartRequestResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Submit([FromBody] CreatePartRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var customerId = await ResolveCustomerIdAsync();
        if (customerId == null) return Unauthorized(new { message = "Customer record not found." });

        var request = await _partRequestService.SubmitAsync(customerId.Value, dto);
        return StatusCode(StatusCodes.Status201Created, request);
    }

    private async Task<int?> ResolveCustomerIdAsync()
    {
        var userIdClaim = User.FindFirstValue("userId");
        if (!int.TryParse(userIdClaim, out var userId)) return null;
        try { return await _customerService.GetCustomerIdByUserIdAsync(userId); }
        catch { return null; }
    }
}
