using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.DTOs.PurchaseInvoice;

public class CreatePurchaseInvoiceDto
{
    [Required]
    public int VendorId { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "At least one item is required.")]
    public List<PurchaseInvoiceItemRequestDto> Items { get; set; } = new();
}

public class PurchaseInvoiceItemRequestDto
{
    [Required]
    public int PartId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Unit cost price must be greater than 0.")]
    public decimal UnitCostPrice { get; set; }
}
