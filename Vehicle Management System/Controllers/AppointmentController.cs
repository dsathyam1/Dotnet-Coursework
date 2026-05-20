using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vehicle_Management_System.DTOs.Appointment;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Controllers;

[ApiController]
[Route("api/appointments")]
[Authorize]
public class AppointmentController : ControllerBase
{
    private readonly IAppointmentService _service;
    public AppointmentController(IAppointmentService service) => _service = service;

    // GET /api/appointments  — Admin or Staff
    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    // GET /api/appointments/mine  — Customer self
    [HttpGet("mine")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMine()
    {
        // customerId resolved by service from user id
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();
        var list = await _service.GetByCustomerUserIdAsync(userId);
        return Ok(list);
    }

    // GET /api/appointments/customer/{customerId}  — Admin or Staff
    [HttpGet("customer/{customerId:int}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetByCustomer(int customerId)
        => Ok(await _service.GetByCustomerAsync(customerId));

    // GET /api/appointments/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try { return Ok(await _service.GetByIdAsync(id)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    // POST /api/appointments  — Customer
    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create([FromBody] CustomerCreateAppointmentDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();
        try
        {
            var appt = await _service.CreateByUserIdAsync(userId, dto);
            return CreatedAtAction(nameof(GetById), new { id = appt.Id }, appt);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    // PATCH /api/appointments/{id}/status  — Admin or Staff
    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        try { return Ok(await _service.UpdateStatusAsync(id, dto.Status)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    // DELETE /api/appointments/{id}  — Admin only
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        try { await _service.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    private int GetUserId() =>
        int.TryParse(User.FindFirstValue("userId"), out var id) ? id : 0;
}

public class UpdateStatusDto
{
    public string Status { get; set; } = string.Empty;
}
