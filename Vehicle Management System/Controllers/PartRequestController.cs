using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vehicle_Management_System.DTOs.PartRequest;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Controllers;

[ApiController]
[Route("api/part-requests")]
[Authorize]
public class PartRequestController : ControllerBase
{
    private readonly IPartRequestService _service;
    public PartRequestController(IPartRequestService service) => _service = service;

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("mine")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMine()
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();
        // customerId lookup done inside service
        var list = await _service.GetByCustomerUserIdAsync(userId);
        return Ok(list);
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create([FromBody] CreatePartRequestDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();
        try
        {
            var req = await _service.CreateByUserIdAsync(userId, dto);
            return StatusCode(StatusCodes.Status201Created, req);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateRequestStatusDto dto)
    {
        try { return Ok(await _service.UpdateStatusAsync(id, dto.Status)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    private int GetUserId() =>
        int.TryParse(User.FindFirstValue("userId"), out var id) ? id : 0;
}

public class UpdateRequestStatusDto
{
    public string Status { get; set; } = string.Empty;
}
