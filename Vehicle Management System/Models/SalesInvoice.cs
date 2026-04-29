namespace Vehicle_Management_System.Models;

public class SalesInvoice
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public int StaffId { get; set; }

    public decimal TotalAmount { get; set; }

    public bool DiscountApplied { get; set; }

    public DateTime SaleDate { get; set; }

    public bool IsPaid { get; set; }

    public bool IsCreditSale { get; set; }

    // Navigation
    public Customer Customer { get; set; } = null!;
    public Staff Staff { get; set; } = null!;
    public ICollection<SalesInvoiceItem> SalesInvoiceItems { get; set; } = new List<SalesInvoiceItem>();
}
