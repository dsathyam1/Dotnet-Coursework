using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vehicle_Management_System.DTOs.PurchaseInvoice;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Controllers;

[ApiController]
[Route("api/purchase-invoices")]
[Authorize(Roles = "Admin")]
public class PurchaseInvoiceController : ControllerBase
{
    private readonly IPurchaseInvoiceService _invoiceService;

    public PurchaseInvoiceController(IPurchaseInvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }

    // GET /api/purchase-invoices
    [HttpGet]
    [ProducesResponseType(typeof(List<PurchaseInvoiceResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var invoices = await _invoiceService.GetAllAsync();
        return Ok(invoices);
    }

    // GET /api/purchase-invoices/{id}
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PurchaseInvoiceResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var invoice = await _invoiceService.GetByIdAsync(id);
            return Ok(invoice);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // POST /api/purchase-invoices
    [HttpPost]
    [ProducesResponseType(typeof(PurchaseInvoiceResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Create([FromBody] CreatePurchaseInvoiceDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var adminUserId = GetCurrentUserId();
        if (adminUserId == null)
            return Unauthorized(new { message = "Invalid token." });

        try
        {
            var invoice = await _invoiceService.CreateAsync(dto, adminUserId.Value);
            return CreatedAtAction(nameof(GetById), new { id = invoice.Id }, invoice);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private int? GetCurrentUserId()
    {
        var claim = User.FindFirstValue("userId");
        return int.TryParse(claim, out var id) ? id : null;
    }
}
