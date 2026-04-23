using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vehicle_Management_System.DTOs.Customer;
using Vehicle_Management_System.DTOs.Vehicle;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize]
public class CustomerController : ControllerBase
{
    private readonly ICustomerService _service;
    private readonly ISalesInvoiceService _invoiceService;

    public CustomerController(ICustomerService service, ISalesInvoiceService invoiceService)
    {
        _service = service;
        _invoiceService = invoiceService;
    }

    // GET /api/customers  — Admin or Staff
    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(List<CustomerListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var list = await _service.GetAllAsync();
        return Ok(list);
    }

    // GET /api/customers/search?q=...  — Admin or Staff
    [HttpGet("search")]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(List<CustomerSearchResultDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q)) return Ok(new List<CustomerSearchResultDto>());
        var results = await _service.SearchAsync(q);
        return Ok(results);
    }

    // GET /api/customers/me  — Customer (self)
    [HttpGet("me")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(typeof(CustomerDetailDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMe()
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();
        try
        {
            var customer = await _service.GetByUserIdAsync(userId);
            return Ok(customer);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // GET /api/customers/me/vehicles  — Customer (self)
    [HttpGet("me/vehicles")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(typeof(List<VehicleResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyVehicles()
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();
        try
        {
            var customer = await _service.GetByUserIdAsync(userId);
            return Ok(customer.Vehicles);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // POST /api/customers/me/vehicles  — Customer (self)
    [HttpPost("me/vehicles")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(typeof(VehicleResponseDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddMyVehicle([FromBody] VehicleDto dto)
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();
        try
        {
            var vehicle = await _service.AddVehicleByUserIdAsync(userId, dto);
            return StatusCode(StatusCodes.Status201Created, vehicle);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // DELETE /api/customers/me/vehicles/{vehicleId}  — Customer (self)
    [HttpDelete("me/vehicles/{vehicleId:int}")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteMyVehicle(int vehicleId)
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();
        try
        {
            await _service.DeleteVehicleByUserIdAsync(userId, vehicleId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // GET /api/customers/me/invoices  — Customer (self)
    [HttpGet("me/invoices")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyInvoices()
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();
        try
        {
            var customer = await _service.GetByUserIdAsync(userId);
            var invoices = await _invoiceService.GetByCustomerAsync(customer.Id);
            return Ok(invoices);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // GET /api/customers/{id}  — Admin or Staff
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(CustomerDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var customer = await _service.GetByIdAsync(id);
            return Ok(customer);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // POST /api/customers  — Admin or Staff
    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(CustomerDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateCustomerDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var customer = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = customer.Id }, customer);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PUT /api/customers/{id}  — Admin or Staff
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(CustomerDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCustomerDto dto)
    {
        try
        {
            var customer = await _service.UpdateAsync(id, dto);
            return Ok(customer);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // POST /api/customers/{id}/vehicles  — Admin or Staff
    [HttpPost("{id:int}/vehicles")]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(VehicleResponseDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddVehicle(int id, [FromBody] VehicleDto dto)
    {
        try
        {
            var vehicle = await _service.AddVehicleAsync(id, dto);
            return StatusCode(StatusCodes.Status201Created, vehicle);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // DELETE /api/customers/{id}/vehicles/{vehicleId}  — Admin or Staff
    [HttpDelete("{id:int}/vehicles/{vehicleId:int}")]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteVehicle(int id, int vehicleId)
    {
        try
        {
            await _service.DeleteVehicleAsync(id, vehicleId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // GET /api/customers/{id}/vehicles  — Admin or Staff
    [HttpGet("{id:int}/vehicles")]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(List<VehicleResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVehicles(int id)
    {
        try
        {
            var customer = await _service.GetByIdAsync(id);
            return Ok(customer.Vehicles);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // GET /api/customers/{id}/invoices  — Admin or Staff
    [HttpGet("{id:int}/invoices")]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInvoices(int id)
    {
        var invoices = await _invoiceService.GetByCustomerAsync(id);
        return Ok(invoices);
    }

    private int GetUserId()
    {
        var claim = User.FindFirstValue("userId");
        return int.TryParse(claim, out var id) ? id : 0;
    }
}
