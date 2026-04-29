using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.Models;

public class Staff
{
    public int Id { get; set; }

    public int UserId { get; set; }

    [MaxLength(20)]
    public string? EmployeeCode { get; set; }

    [MaxLength(50)]
    public string? Department { get; set; }

    public DateTime JoinedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<SalesInvoice> SalesInvoices { get; set; } = new List<SalesInvoice>();
}
