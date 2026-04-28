namespace Vehicle_Management_System.DTOs.Report;

public class TopSpenderDto
{
    public int CustomerId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public decimal TotalSpent { get; set; }
}

public class RegularCustomerDto
{
    public int CustomerId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int PurchaseCount { get; set; }
    public decimal TotalSpent { get; set; }
}

public class PendingCreditDto
{
    public int CustomerId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public decimal CreditBalance { get; set; }
    public DateTime? LastCreditPaidAt { get; set; }
    public int DaysOverdue { get; set; }
}
