using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vehicle_Management_System.DTOs.SalesInvoice;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Controllers;

[ApiController]
[Route("api/sales-invoices")]
[Authorize(Roles = "Admin,Staff")]
public class SalesInvoiceController : ControllerBase
{
    private readonly ISalesInvoiceService _salesInvoiceService;

    public SalesInvoiceController(ISalesInvoiceService salesInvoiceService)
    {
        _salesInvoiceService = salesInvoiceService;
    }

    // GET /api/sales-invoices
    [HttpGet]
    [ProducesResponseType(typeof(List<SalesInvoiceResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var invoices = await _salesInvoiceService.GetAllAsync();
        return Ok(invoices);
    }

    // GET /api/sales-invoices/{id}
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(SalesInvoiceResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var invoice = await _salesInvoiceService.GetByIdAsync(id);
            return Ok(invoice);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // POST /api/sales-invoices
    [HttpPost]
    [Authorize(Roles = "Staff")]
    [ProducesResponseType(typeof(SalesInvoiceResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateSalesInvoiceDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var staffUserId = GetCurrentUserId();
        if (staffUserId == null)
            return Unauthorized(new { message = "Invalid token." });

        try
        {
            var invoice = await _salesInvoiceService.CreateAsync(dto, staffUserId.Value);
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

    // ── Helpers ───────────────────────────────────────────────────────────────
    private int? GetCurrentUserId()
    {
        var claim = User.FindFirstValue("userId");
        return int.TryParse(claim, out var id) ? id : null;
    }
}
