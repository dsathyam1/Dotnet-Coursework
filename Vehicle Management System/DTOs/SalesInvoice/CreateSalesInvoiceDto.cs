using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.DTOs.SalesInvoice;

public class CreateSalesInvoiceDto
{
    [Required]
    public int CustomerId { get; set; }

    public bool IsCreditSale { get; set; } = false;

    public bool DiscountApplied { get; set; } = false;

    [Required]
    [MinLength(1)]
    public List<CreateSalesInvoiceItemDto> Items { get; set; } = new();
}

public class CreateSalesInvoiceItemDto
{
    [Required]
    public int PartId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}
