using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vehicle_Management_System.DTOs.Appointment;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Controllers;

[ApiController]
[Route("api/appointments")]
[Authorize(Roles = "Customer")]
public class AppointmentController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;
    private readonly ICustomerService _customerService;

    public AppointmentController(IAppointmentService appointmentService, ICustomerService customerService)
    {
        _appointmentService = appointmentService;
        _customerService    = customerService;
    }

    // GET /api/appointments/my
    [HttpGet("my")]
    [ProducesResponseType(typeof(List<AppointmentResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMy()
    {
        var customerId = await ResolveCustomerIdAsync();
        if (customerId == null) return Unauthorized(new { message = "Customer record not found." });

        var appointments = await _appointmentService.GetMyAppointmentsAsync(customerId.Value);
        return Ok(appointments);
    }

    // POST /api/appointments
    [HttpPost]
    [ProducesResponseType(typeof(AppointmentResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Book([FromBody] CreateAppointmentDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var customerId = await ResolveCustomerIdAsync();
        if (customerId == null) return Unauthorized(new { message = "Customer record not found." });

        try
        {
            var appointment = await _appointmentService.BookAsync(customerId.Value, dto);
            return StatusCode(StatusCodes.Status201Created, appointment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // DELETE /api/appointments/{id}
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Cancel(int id)
    {
        var customerId = await ResolveCustomerIdAsync();
        if (customerId == null) return Unauthorized(new { message = "Customer record not found." });

        try
        {
            await _appointmentService.CancelAsync(id, customerId.Value);
            return Ok(new { message = "Appointment cancelled successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private async Task<int?> ResolveCustomerIdAsync()
    {
        var userIdClaim = User.FindFirstValue("userId");
        if (!int.TryParse(userIdClaim, out var userId)) return null;
        try { return await _customerService.GetCustomerIdByUserIdAsync(userId); }
        catch { return null; }
    }
}
