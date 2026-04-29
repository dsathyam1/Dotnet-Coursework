namespace Vehicle_Management_System.Models;

public class SalesInvoiceItem
{
    public int Id { get; set; }

    public int SalesInvoiceId { get; set; }

    public int PartId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitSellingPrice { get; set; }

    // Navigation
    public SalesInvoice SalesInvoice { get; set; } = null!;
    public Part Part { get; set; } = null!;
}
