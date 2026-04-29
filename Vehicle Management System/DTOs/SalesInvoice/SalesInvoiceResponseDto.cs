namespace Vehicle_Management_System.DTOs.SalesInvoice;

public class SalesInvoiceResponseDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int StaffId { get; set; }
    public string StaffName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public bool DiscountApplied { get; set; }
    public decimal DiscountAmount { get; set; }
    public DateTime SaleDate { get; set; }
    public bool IsPaid { get; set; }
    public bool IsCreditSale { get; set; }
    public List<SalesInvoiceItemResponseDto> Items { get; set; } = new();
}

public class SalesInvoiceItemResponseDto
{
    public int Id { get; set; }
    public int PartId { get; set; }
    public string PartName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitSellingPrice { get; set; }
    public decimal LineTotal { get; set; }
}
