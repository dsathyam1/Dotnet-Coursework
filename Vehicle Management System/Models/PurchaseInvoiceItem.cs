namespace Vehicle_Management_System.Models;

public class PurchaseInvoiceItem
{
    public int Id { get; set; }

    public int PurchaseInvoiceId { get; set; }

    public int PartId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitCostPrice { get; set; }

    // Navigation
    public PurchaseInvoice PurchaseInvoice { get; set; } = null!;
    public Part Part { get; set; } = null!;
}
