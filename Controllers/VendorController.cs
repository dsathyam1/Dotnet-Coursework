using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vehicle_Management_System.DTOs.Vendor;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Controllers;

[ApiController]
[Route("api/vendors")]
[Authorize(Roles = "Admin")]
public class VendorController : ControllerBase
{
    private readonly IVendorService _vendorService;

    public VendorController(IVendorService vendorService)
    {
        _vendorService = vendorService;
    }

    // GET /api/vendors
    [HttpGet]
    [ProducesResponseType(typeof(List<VendorResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var vendors = await _vendorService.GetAllAsync();
        return Ok(vendors);
    }

    // GET /api/vendors/{id}
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(VendorResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var vendor = await _vendorService.GetByIdAsync(id);
            return Ok(vendor);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // POST /api/vendors
    [HttpPost]
    [ProducesResponseType(typeof(VendorResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] VendorDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var vendor = await _vendorService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = vendor.Id }, vendor);
    }

    // PUT /api/vendors/{id}
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(VendorResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] VendorDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var vendor = await _vendorService.UpdateAsync(id, dto);
            return Ok(vendor);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // DELETE /api/vendors/{id}
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _vendorService.DeleteAsync(id);
            return NoContent();
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
