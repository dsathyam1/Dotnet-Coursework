namespace Vehicle_Management_System.Models;

public class PurchaseInvoice
{
    public int Id { get; set; }

    public int VendorId { get; set; }

    public decimal TotalAmount { get; set; }

    public DateTime PurchaseDate { get; set; }

    public int CreatedByAdminId { get; set; }

    // Navigation
    public Vendor Vendor { get; set; } = null!;
    public ICollection<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; } = new List<PurchaseInvoiceItem>();
}
