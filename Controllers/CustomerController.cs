using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vehicle_Management_System.DTOs.Customer;
using Vehicle_Management_System.DTOs.Vehicle;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize(Roles = "Admin,Staff")]
public class CustomerController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomerController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    // GET /api/customers/search?q=term  ← must be declared BEFORE {id} route
    [HttpGet("search")]
    [ProducesResponseType(typeof(List<CustomerSearchResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest(new { message = "Search term 'q' is required." });

        var results = await _customerService.SearchAsync(q);
        return Ok(results);
    }

    // GET /api/customers
    [HttpGet]
    [ProducesResponseType(typeof(List<CustomerListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var customers = await _customerService.GetAllAsync();
        return Ok(customers);
    }

    // GET /api/customers/{id}
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(CustomerDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var customer = await _customerService.GetByIdAsync(id);
            return Ok(customer);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // POST /api/customers
    [HttpPost]
    [ProducesResponseType(typeof(CustomerDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateCustomerDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var customer = await _customerService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = customer.Id }, customer);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // PUT /api/customers/{id}
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(CustomerDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCustomerDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var customer = await _customerService.UpdateAsync(id, dto);
            return Ok(customer);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // GET /api/customers/{id}/vehicles
    [HttpGet("{id:int}/vehicles")]
    [ProducesResponseType(typeof(List<VehicleResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetVehicles(int id)
    {
        try
        {
            var vehicles = await _customerService.GetVehiclesAsync(id);
            return Ok(vehicles);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // POST /api/customers/{id}/vehicles
    [HttpPost("{id:int}/vehicles")]
    [ProducesResponseType(typeof(VehicleResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddVehicle(int id, [FromBody] VehicleDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var vehicle = await _customerService.AddVehicleAsync(id, dto);
            return StatusCode(StatusCodes.Status201Created, vehicle);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // GET /api/customers/{id}/invoices
    [HttpGet("{id:int}/invoices")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetInvoices(int id)
    {
        try
        {
            var invoices = await _customerService.GetInvoicesAsync(id);
            return Ok(invoices);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
