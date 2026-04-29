using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Controllers;

/// <summary>
/// Customer self-service routes under /api/customers/my/*
/// Separate from CustomerController (Staff/Admin) to keep role boundaries clear.
/// </summary>
[ApiController]
[Route("api/customers/my")]
[Authorize(Roles = "Customer")]
public class CustomerSelfController : ControllerBase
{
    private readonly ICustomerService     _customerService;
    private readonly IAppointmentService  _appointmentService;

    public CustomerSelfController(
        ICustomerService customerService,
        IAppointmentService appointmentService)
    {
        _customerService    = customerService;
        _appointmentService = appointmentService;
    }

    // GET /api/customers/my/profile
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var customerId = await ResolveCustomerIdAsync();
        if (customerId == null) return Unauthorized(new { message = "Customer record not found." });

        try
        {
            var profile = await _customerService.GetByIdAsync(customerId.Value);
            return Ok(profile);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // GET /api/customers/my/invoices
    [HttpGet("invoices")]
    public async Task<IActionResult> GetInvoices()
    {
        var customerId = await ResolveCustomerIdAsync();
        if (customerId == null) return Unauthorized(new { message = "Customer record not found." });

        try
        {
            var invoices = await _customerService.GetInvoicesAsync(customerId.Value);
            return Ok(invoices);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // GET /api/customers/my/appointments
    [HttpGet("appointments")]
    public async Task<IActionResult> GetAppointments()
    {
        var customerId = await ResolveCustomerIdAsync();
        if (customerId == null) return Unauthorized(new { message = "Customer record not found." });

        var appointments = await _appointmentService.GetMyAppointmentsAsync(customerId.Value);
        return Ok(appointments);
    }

    // POST /api/customers/my/vehicles
    [HttpPost("vehicles")]
    public async Task<IActionResult> AddVehicle([FromBody] Vehicle_Management_System.DTOs.Vehicle.VehicleDto dto)
    {
        var customerId = await ResolveCustomerIdAsync();
        if (customerId == null) return Unauthorized(new { message = "Customer record not found." });

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var vehicle = await _customerService.AddVehicleAsync(customerId.Value, dto);
            return StatusCode(StatusCodes.Status201Created, vehicle);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private async Task<int?> ResolveCustomerIdAsync()
    {
        var claim = User.FindFirstValue("userId");
        if (!int.TryParse(claim, out var userId)) return null;
        try { return await _customerService.GetCustomerIdByUserIdAsync(userId); }
        catch { return null; }
    }
}
