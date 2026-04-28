using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Controllers;

[ApiController]
[Route("api/reports")]
public class ReportController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportController(IReportService reportService)
    {
        _reportService = reportService;
    }

    // GET /api/reports/financial?period=daily|monthly|yearly
    [HttpGet("financial")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetFinancialReport([FromQuery] string? period = "monthly")
    {
        var p = (period ?? "monthly").Trim().ToLower();
        var validPeriods = new[] { "daily", "monthly", "yearly" };
        if (!validPeriods.Contains(p))
            return BadRequest(new { message = $"Period '{p}' must be 'daily', 'monthly', or 'yearly'." });

        try
        {
            var report = await _reportService.GetFinancialReportAsync(p);
            return Ok(report);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET /api/reports/customers/top-spenders
    [HttpGet("customers/top-spenders")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetTopSpenders()
    {
        var result = await _reportService.GetTopSpendersAsync();
        return Ok(result);
    }

    // GET /api/reports/customers/regulars
    [HttpGet("customers/regulars")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetRegularCustomers()
    {
        var result = await _reportService.GetRegularCustomersAsync();
        return Ok(result);
    }

    // GET /api/reports/customers/pending-credits
    [HttpGet("customers/pending-credits")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetPendingCredits()
    {
        var result = await _reportService.GetPendingCreditsAsync();
        return Ok(result);
    }
}
