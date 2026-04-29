using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.DTOs.SalesInvoice;

public class CreateSalesInvoiceDto
{
    [Required]
    public int CustomerId { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "At least one item is required.")]
    public List<SalesInvoiceItemRequestDto> Items { get; set; } = new();

    public bool IsCreditSale { get; set; }
}

public class SalesInvoiceItemRequestDto
{
    [Required]
    public int PartId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; }
}
