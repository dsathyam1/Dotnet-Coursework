using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vehicle_Management_System.DTOs.Staff;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Controllers;

[ApiController]
[Route("api/admin/staff")]
[Authorize(Roles = "Admin")]
public class StaffController : ControllerBase
{
    private readonly IStaffService _staffService;

    public StaffController(IStaffService staffService)
    {
        _staffService = staffService;
    }

    // GET /api/admin/staff
    [HttpGet]
    [ProducesResponseType(typeof(List<StaffResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllStaff()
    {
        var staff = await _staffService.GetAllStaffAsync();
        return Ok(staff);
    }

    // POST /api/admin/staff
    [HttpPost]
    [ProducesResponseType(typeof(StaffResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateStaff([FromBody] CreateStaffDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _staffService.CreateStaffAsync(dto);
            return StatusCode(StatusCodes.Status201Created, result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // PUT /api/admin/staff/{id}
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(StaffResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStaff(int id, [FromBody] UpdateStaffDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _staffService.UpdateStaffAsync(id, dto);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // DELETE /api/admin/staff/{id}
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeactivateStaff(int id)
    {
        try
        {
            var deactivated = await _staffService.DeactivateStaffAsync(id);
            if (!deactivated)
                return Conflict(new { message = "Staff member is already deactivated." });

            return Ok(new { message = "Staff member deactivated successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
