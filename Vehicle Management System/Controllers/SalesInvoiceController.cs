using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vehicle_Management_System.DTOs.SalesInvoice;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Controllers;

[ApiController]
[Route("api/sales-invoices")]
[Authorize]
public class SalesInvoiceController : ControllerBase
{
    private readonly ISalesInvoiceService _service;

    public SalesInvoiceController(ISalesInvoiceService service)
    {
        _service = service;
    }

    // GET /api/sales-invoices  — Admin and Staff
    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(List<SalesInvoiceResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var invoices = await _service.GetAllAsync();
        return Ok(invoices);
    }

    // GET /api/sales-invoices/{id}  — Admin and Staff
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(SalesInvoiceResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var invoice = await _service.GetByIdAsync(id);
            return Ok(invoice);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // POST /api/sales-invoices  — Staff or Admin
    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(SalesInvoiceResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateSalesInvoiceDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Extract the userId from the JWT "userId" claim set by JwtHelper
        var userIdClaim = User.FindFirstValue("userId");
        if (!int.TryParse(userIdClaim, out var staffUserId))
            return Unauthorized(new { message = "Invalid token — userId claim missing." });

        try
        {
            var invoice = await _service.CreateAsync(dto, staffUserId);
            return CreatedAtAction(nameof(GetById), new { id = invoice.Id }, invoice);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // PATCH /api/sales-invoices/{id}/pay  — Admin or Staff
    [HttpPatch("{id:int}/pay")]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(SalesInvoiceResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> MarkAsPaid(int id)
    {
        try
        {
            var invoice = await _service.MarkAsPaidAsync(id);
            return Ok(invoice);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }
}
